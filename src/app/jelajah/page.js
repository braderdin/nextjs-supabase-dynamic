"use client";

import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { createClient } from "@supabase/supabase-js"; // ➔ TAMBAHAN: Import Supabase Client
import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function JelajahKampung() {
  // --- STATE DATA LIVE ---
  const [wargaSiber, setWargaSiber] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLog, setErrorLog] = useState("");
  const [carian, setCarian] = useState("");

  // ➔ TAMBAHAN: State kawalan sistem jiran & sesi auth
  const [userSesi, setUserSesi] = useState(null);
  const [userUsername, setUserUsername] = useState("");
  const [permintaanDihantar, setPermintaanDihantar] = useState([]);
  const [loadingButang, setLoadingButang] = useState({});

  // 1. Ambil data direktori R2 secara automatik dari API
  useEffect(() => {
    async function ambilWargaLive() {
      try {
        const respon = await fetch("/api/warga");
        const hasil = await respon.json();
        
        if (hasil.success) {
          const dataWarga = hasil.warga.map((nama, indeks) => {
            const senaraiStiker = ["✨", "🏍️", "💻", "🎸", "🛵", "🔥", "🐱", "👾", "📻"];
            const stikerRawak = senaraiStiker[indeks % senaraiStiker.length];
            
            return {
              nama: nama,
              tajuk: `Teratak Siber ${nama}`,
              pelawat: Math.floor(Math.random() * 300) + 15, 
              stiker: stikerRawak
            };
          });
          setWargaSiber(dataWarga);
        } else {
          setErrorLog(hasil.error || "Gagal memproses direktori warga.");
        }
      } catch (err) {
        setErrorLog("Ralat Sistem: Gagal berhubung dengan satelit R2.");
      } finally {
        setLoading(false);
      }
    }

    ambilWargaLive();
  }, []);

  // 2. ➔ TAMBAHAN: Semak sesi pengguna aktif & arkib rekod ikatan jiran yang pernah dipohon
  useEffect(() => {
    async function semakSesiDanPermintaan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserSesi(user);
        
        // Dapatkan username milik pengguna semasa dari table warga_profil
        const { data: profil } = await supabase
          .from("warga_profil")
          .eq("id", user.id)
          .maybeSingle();
          
        if (profil) {
          setUserUsername(profil.username.toLowerCase());
        }

        // Tarik rekod permintaan jiran yang pernah dihantar oleh user ini sebelumnya
        const { data: rekodJiran, error } = await supabase
          .from("ikatan_jiran")
          .eq("pengirim_id", user.id);
          
        if (!error && rekodJiran) {
          setPermintaanDihantar(rekodJiran.map(rj => rj.penerima_username.toLowerCase()));
        }
      }
    }
    semakSesiDanPermintaan();
  }, []);

  // 3. ➔ TAMBAHAN: Fungsi memproses hantaran "Mohon Jadi Jiran" ke Supabase
  async function handleMohonJiran(penerimaUsername) {
    if (!userSesi) {
      alert("⚠️ Alamak bang! Kena log masuk / daftar akaun dulu baru boleh mohon jadi jiran.");
      return;
    }

    const targetJiran = penerimaUsername.toLowerCase();
    setLoadingButang(prev => ({ ...prev, [targetJiran]: true }));

    const { error } = await supabase
      .from("ikatan_jiran")
      .insert({
        pengirim_id: userSesi.id,
        penerima_username: targetJiran,
        status: 'pending'
      });

    if (!error) {
      setPermintaanDihantar(prev => [...prev, targetJiran]);
    } else {
      alert("❌ Alamak bang, gagal menghantar permohonan. Sila cuba sebentar lagi.");
    }
    
    setLoadingButang(prev => ({ ...prev, [targetJiran]: false }));
  }

  // Logik penapisan jiran secara real-time
  const wargaTapis = wargaSiber.filter((warga) => {
    const kataKunci = carian.toLowerCase();
    return (
      warga.nama.toLowerCase().includes(kataKunci) ||
      warga.tajuk.toLowerCase().includes(kataKunci)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* HEADER HALAMAN */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-yellow-400 uppercase tracking-tight">
            🌐 JELAJAH KAMPUNG SIBER LIVE
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Direktori Real-Time Teratak Digital Warga Nusantara. Data ditarik terus dari Cloudflare R2!
          </p>
        </div>

        <MenuNavigasiSiber />

        {/* WINDOW BOX: SENARAI TERATAK WARKAH */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6]">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
            <span>🗂️ direktori_warga_siber.db</span>
            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">📡 LIVE_CONNECTION</span>
          </div>

          <div className="p-4 md:p-6">
            
            {/* 1. JIKA SEDANG LOADING */}
            {loading && (
              <div className="text-center font-mono text-xs py-12 text-slate-500 border border-dashed border-slate-800 bg-slate-950">
                🔄 Sedang memancar isyarat dan mengira jumlah teratak siber...
              </div>
            )}

            {/* 2. JIKA ADA RALAT */}
            {errorLog && (
              <div className="text-center font-mono text-xs py-12 text-red-400 border border-red-900/40 bg-red-950/20">
                [AMARAN SISTEM]: {errorLog}
              </div>
            )}

            {/* 3. JIKA BALDI R2 KOSONG */}
            {!loading && !errorLog && wargaSiber.length === 0 && (
              <div className="text-center font-mono text-xs py-12 text-slate-500 border border-dashed border-slate-800 bg-slate-950">
                📭 Kampung masih sunyi... Belum ada warga yang membina teratak siber.
              </div>
            )}

            {/* BAR CARIAN KAMPUNG SIBER */}
            {!loading && !errorLog && wargaSiber.length > 0 && (
              <div className="mb-6 p-4 bg-slate-950 border-2 border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="font-mono text-xs text-yellow-400 flex items-center gap-2 w-full md:w-auto whitespace-nowrap">
                  <span>🔍</span>
                  <span>ENJIN_CARIAN.EXE :</span>
                </div>
                <input 
                  type="text"
                  placeholder="Cari nama teratak atau jiran siber (cth: abangdin)..."
                  value={carian}
                  onChange={(e) => setCarian(e.target.value)}
                  className="w-full md:flex-1 bg-slate-900 border border-slate-700 font-mono text-xs p-2 text-pink-400 placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                />
                {carian && (
                  <button 
                    onClick={() => setCarian("")}
                    className="w-full md:w-auto text-[10px] font-mono uppercase bg-slate-800 hover:bg-red-900 px-3 py-2 text-slate-400 hover:text-white border border-slate-700 transition-all"
                  >
                    Kosongkan
                  </button>
                )}
              </div>
            )}

            {/* JIKA JIRAN YANG DICARI TIADA DALAM HASIL TAPISAN */}
            {!loading && !errorLog && wargaSiber.length > 0 && wargaTapis.length === 0 && (
              <div className="text-center font-mono text-xs py-12 text-yellow-500 border border-dashed border-slate-800 bg-slate-950">
                ⚠️ Alamak bang! Jiran atau teratak "@{carian}" tidak dijumpai di kawasan ini.
              </div>
            )}

            {/* 4. PAPARAN GRID DATA */}
            {!loading && !errorLog && wargaTapis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wargaTapis.map((warga, indeks) => {
                  const targetNama = warga.nama.toLowerCase();
                  const adakahTuanTanah = userUsername === targetNama;
                  const sudahDipohon = permintaanDihantar.includes(targetNama);

                  return (
                    <div 
                      key={indeks} 
                      className="bg-slate-950 border-2 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500 transition-all group shadow-[3px_3px_0px_0px_rgba(59,130,246,0.2)]"
                    >
                      <div className="font-mono">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                          <span className="text-xs text-pink-400 font-bold">
                            @{warga.nama} {adakahTuanTanah && <span className="text-[10px] text-slate-500">(Anda)</span>}
                          </span>
                          <span className="text-sm">{warga.stiker}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                          {warga.tajuk}
                        </h3>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          🔥 {warga.pelawat} Roda Pelawat
                        </span>
                      </div>

                      {/* PANEL BUTANG AKSI TIERED */}
                      <div className="flex flex-col gap-2 mt-4">
                        <Link 
                          href={`/laman/${warga.nama}`}
                          className="w-full text-center bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-slate-950 text-slate-300 font-mono text-[11px] py-1.5 font-bold transition-all uppercase"
                        >
                          🚀 Ziarah Teratak
                        </Link>

                        {/* ➔ TAMBAHAN UI: Butang Mohon Jiran Dinamik */}
                        {!adakahTuanTanah && (
                          <button
                            onClick={() => handleMohonJiran(warga.nama)}
                            disabled={sudahDipohon || loadingButang[targetNama]}
                            className={`w-full text-center font-mono text-[11px] py-1.5 font-bold transition-all uppercase border ${
                              sudahDipohon
                                ? "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                                : "bg-slate-900 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-slate-950"
                            }`}
                          >
                            {sudahDipohon 
                              ? "⏳ Menunggu Kelulusan" 
                              : loadingButang[targetNama] 
                              ? "⚡ Memohon..." 
                              : "🤝 Mohon Jadi Jiran"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}