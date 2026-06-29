"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HalamanUtamaPondok() {
  // --- STATE DATA ---
  const [senaraiPondok, setSenaraiPondok] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE CIPTA PONDOK BARU ---
  const [namaPondok, setNamaPondok] = useState("");
  const [deskripsiPondok, setDeskripsiPondok] = useState("");
  const [loadingCipta, setLoadingCipta] = useState(false);

  // 1. Ambil Sesi Pengguna & Senarai Pondok secara Live
  useEffect(() => {
    async function muatDataPondok() {
      try {
        // Semak auth user semasa
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Tarik semua senarai pondok dari database
        const { data, error } = await supabase
          .from('pondok')
          .select('*, warga_profil(username)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSenaraiPondok(data);
        }
      } catch (err) {
        console.error("Gagal memuatkan dataran pondok siber.", err);
      } finally {
        setLoading(false);
      }
    }
    muatDataPondok();
  }, []);

  // 2. Logik Mencipta Pondok Siber Baharu
  async function handleCiptaPondok(e) {
    e.preventDefault();
    if (!user) {
      alert("⚠️ Alamak bang! Kena log masuk dulu baru boleh pacak pondok baharu.");
      return;
    }

    // Bersihkan nama untuk dijadikan slug (Cth: "#Geng NextJS" -> "geng-nextjs")
    const slugPondok = namaPondok
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (slugPondok.length < 3) {
      alert("⚠️ Nama pondok terlalu pendek atau tidak sah abangku!");
      return;
    }

    setLoadingCipta(true);

    const { error } = await supabase
      .from('pondok')
      .insert({
        nama: namaPondok.startsWith("#") ? namaPondok : `#${namaPondok}`,
        slug: slugPondok,
        deskripsi: deskripsiPondok,
        cipta_oleh: user.id
      });

    if (!error) {
      alert("🎉 Tahniah abangku! Pondok siber baharu berjaya dipacak!");
      setNamaPondok("");
      setDeskripsiPondok("");
      
      // Segarkan senarai pondok siber
      const { data } = await supabase.from('pondok').select('*, warga_profil(username)').order('created_at', { ascending: false });
      if (data) setSenaraiPondok(data);
    } else {
      if (error.code === '23505') {
        alert("❌ Alamak, pondok dengan topik/nama ini sudah wujud dalam kampung siber.");
      } else {
        alert(`❌ Gagal: ${error.message}`);
      }
    }
    setLoadingCipta(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* HEADER HALAMAN */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#a855f7]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-purple-400 uppercase tracking-tight">
            ⛺ DATARAN PONDOK SIBER NUSANTARA
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Pusat komuniti bertukar snippet kod, perbincangan BBS gaya bebas, dan perkongsian seni bina HTML.
          </p>
        </div>

        <MenuNavigasiSiber />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* SEBELAH KIRI: SENARAI PONDOK SIBER YANG WUJUD */}
          <div className="lg:col-span-2 bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6]">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
              <span>🗂️ direktori_pondok_komuniti.db</span>
              <span className="text-[10px] text-blue-400 font-bold">CIRCLES_ACTIVE</span>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              {loading && (
                <div className="text-center font-mono text-xs py-8 text-slate-500">
                  🔄 Sedang memanggil isyarat frekuensi pondok siber...
                </div>
              )}

              {!loading && senaraiPondok.length === 0 && (
                <div className="text-center font-mono text-xs py-12 text-slate-500 border border-dashed border-slate-800 bg-slate-950">
                  📭 Sunyi sepi dataran ni... Belum ada warga yang memacak pondok perbincangan.
                </div>
              )}

              {!loading && senaraiPondok.map((pondok) => (
                <div 
                  key={pondok.id}
                  className="bg-slate-950 border-2 border-slate-850 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-blue-500 transition-colors group"
                >
                  <div className="font-mono space-y-1 max-w-md">
                    <h3 className="text-sm font-bold text-blue-400 group-hover:underline">
                      {pondok.nama}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {pondok.deskripsi || "[ Tiada deskripsi dibekalkan oleh pengasas pondok ]"}
                    </p>
                    <span className="text-[9px] text-slate-600 block">
                      📌 Dipacak oleh: @{pondok.warga_profil?.username || "warga_siber"}
                    </span>
                  </div>

                  <Link 
                    href={`/pondok/${pondok.slug}`}
                    className="text-center bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-slate-950 text-slate-300 font-mono text-[11px] py-2 px-4 font-bold uppercase transition-all whitespace-nowrap"
                  >
                    🚪 Masuk Pondok
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* SEBELAH KANAN: BORANG PACAK PONDOK BARU */}
          <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#10b981]">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
              <span>🛠️ pacak_pondok.exe</span>
            </div>

            <div className="p-4 font-mono">
              {!user ? (
                <div className="text-center text-[11px] text-slate-500 p-4 border border-dashed border-slate-800 bg-slate-950 leading-relaxed">
                  🔒 Sila log masuk ke akaun kampung siber abang di halaman utama untuk memacak pondok perbincangan baharu.
                </div>
              ) : (
                <form onSubmit={handleCiptaPondok} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Nama Topik Pondok
                    </label>
                    <input 
                      type="text"
                      required
                      maxLength={20}
                      placeholder="Cth: CSSComel, KopiFullStack"
                      value={namaPondok}
                      onChange={(e) => setNamaPondok(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-yellow-400 focus:outline-none focus:border-emerald-500 placeholder:text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Deskripsi Ringkas Pondok
                    </label>
                    <textarea 
                      rows={3}
                      required
                      maxLength={100}
                      placeholder="Terangkan fungsi pondok ini dibina..."
                      value={deskripsiPondok}
                      onChange={(e) => setDeskripsiPondok(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 placeholder:text-slate-700 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loadingCipta}
                    className="w-full bg-slate-950 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black py-2 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                  >
                    {loadingCipta ? "⚡ SEDANG MEMACAK..." : "⛺ PACAK PONDOK SEKARANG"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}