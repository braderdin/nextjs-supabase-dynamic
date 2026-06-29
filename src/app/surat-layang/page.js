"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HubSuratLayang() {
  const [user, setUser] = useState(null);
  const [profilSemasa, setProfilSemasa] = useState(null);
  const [senaraiWarga, setSenaraiWarga] = useState([]);
  const [loading, setLoading] = useState(true);

  const [jiranDipilih, setJiranDipilih] = useState(null);
  const [logMesej, setLogMesej] = useState([]);
  const [teksMesej, setTeksMesej] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const hujungSembangRef = useRef(null);

  useEffect(() => {
    async function inisialisasiPetiSurat() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: profil } = await supabase
            .from('warga_profil')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();
          setProfilSemasa(profil);

          const { data: warga } = await supabase
            .from('warga_profil')
            .select('*')
            .not('id', 'eq', currentUser.id)
            .order('username', { ascending: true });
          if (warga) setSenaraiWarga(warga);
        }
      } catch (err) {
        console.error("Gagal memulakan wayar sistem Surat Layang.", err);
      } finally {
        setLoading(false);
      }
    }
    inisialisasiPetiSurat();
  }, []);

  useEffect(() => {
    if (!user || !jiranDipilih) return;

    async function ambilLogSembang() {
      setLoadingChat(true);
      const { data, error } = await supabase
        .from('surat_layang')
        .select('*')
        .or(`and(pengirim_id.eq.${user.id},penerima_id.eq.${jiranDipilih.id}),and(pengirim_id.eq.${jiranDipilih.id},penerima_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setLogMesej(data);
      }
      setLoadingChat(false);
    }

    ambilLogSembang();

    const saluranRealtime = supabase
      .channel(`bilik_dm_${jiranDipilih.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'surat_layang' },
        (payload) => {
          const dataBaru = payload.new;
          if (
            (dataBaru.pengirim_id === user.id && dataBaru.penerima_id === jiranDipilih.id) ||
            (dataBaru.pengirim_id === jiranDipilih.id && dataBaru.penerima_id === user.id)
          ) {
            setLogMesej((logLama) => [...logLama, dataBaru]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(saluranRealtime);
    };
  }, [jiranDipilih, user]);

  useEffect(() => {
    hujungSembangRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logMesej]);

  async function handleHantarMesej(e) {
    e.preventDefault();
    if (!user || !jiranDipilih || !teksMesej.trim()) return;

    const salinanTeks = teksMesej;
    setTeksMesej("");

    const { error } = await supabase
      .from('surat_layang')
      .insert({
        pengirim_id: user.id,
        penerima_id: jiranDipilih.id,
        mesej: salinanTeks
      });

    if (error) {
      alert("❌ Surat layang gagal dihantar terbang. Cuba lagi!");
      setTeksMesej(salinanTeks);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* HEADER UTAMA */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#10b981]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-emerald-400 uppercase tracking-tight">
            📨 TELEKOMUNIKASI SURAT LAYANG (DM)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Sistem sembang peribadi satu-lawan-satu secara real-time. Diperkuatkan oleh frekuensi Supabase Realtime.
          </p>
        </div>

        <MenuNavigasiSiber />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch flex-1 min-h-[500px]">
          
          {/* PANEL KIRI: SENARAI JIRAN (Disembunyikan pada mobile jika jiran sudah dipilih) */}
          <div className={`bg-slate-900 border-2 border-slate-800 flex flex-col shadow-[4px_4px_0px_0px_#3b82f6] ${jiranDipilih ? 'hidden md:flex' : 'flex'}`}>
            <div className="bg-slate-800 px-3 py-1.5 border-b border-slate-800 font-mono text-[11px] text-slate-300 select-none uppercase tracking-wider">
              👥 Direktori Jiran Aktif
            </div>

            <div className="p-2 flex-1 overflow-y-auto space-y-1 max-h-[450px] md:max-h-[550px]">
              {loading && <div className="text-center font-mono text-[11px] text-slate-600 py-6">Mencari isyarat jiran...</div>}
              
              {!loading && senaraiWarga.length === 0 && (
                <div className="text-center font-mono text-[10px] text-slate-600 py-8">[ Tiada jiran siber lain ditemui ]</div>
              )}

              {!loading && senaraiWarga.map((warga) => (
                <button
                  key={warga.id}
                  onClick={() => setJiranDipilih(warga)}
                  className={`w-full text-left font-mono text-xs p-2.5 transition-colors border flex items-center gap-3 ${
                    jiranDipilih?.id === warga.id
                      ? "bg-blue-950/40 text-blue-400 border-blue-500 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="w-5 h-5 bg-slate-900 border border-slate-800 rounded-none overflow-hidden flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${warga.username}`} alt="avatar" className="w-full h-full object-cover"/>
                  </div>
                  <span className="truncate">@{warga.username}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PANEL KANAN: KOTAK TERMINAL MONOKROM HIJAU CRT (Disembunyikan pada mobile jika belum ada jiran dipilih) */}
          <div className={`md:col-span-2 flex flex-col bg-black border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden ${jiranDipilih ? 'flex' : 'hidden md:flex'}`}>
            
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent bg-[length:100%_4px] opacity-20" />

            {/* Terminal Top Bar */}
            <div className="bg-emerald-950/40 border-b border-emerald-800 px-4 py-2 flex items-center justify-between font-mono text-xs text-emerald-400 select-none">
              <span className="flex items-center gap-2">
                {/* ➔ TOMBOL BARU UNTUK MOBILE: Boleh patah balik ke senarai jiran */}
                {jiranDipilih && (
                  <button 
                    onClick={() => setJiranDipilih(null)}
                    className="md:hidden bg-emerald-900 border border-emerald-500 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight active:scale-95"
                  >
                    ⬅️ Jiran
                  </button>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
                <span className="text-[10px] sm:text-xs">TERMINAL_DM.EXE</span>
              </span>
              <span className="text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none">
                {jiranDipilih ? `CONN: @${jiranDipilih.username.toUpperCase()}` : "STATUS: IDLE"}
              </span>
            </div>

            {/* Ruangan Paparan Log Sembang Mesej */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-4 text-emerald-400 min-h-[350px] max-h-[400px] md:max-h-[450px]">
              {!user && (
                <div className="text-center text-[11px] text-emerald-700 py-12">
                  [ KUNCI_SISTEM ]: Sila log masuk akaun kampung siber abang di teraju utama untuk mengakses enkripsi surat layang.
                </div>
              )}

              {user && !jiranDipilih && (
                <div className="text-center text-[11.5px] text-emerald-600/70 py-16 animate-pulse select-none">
                  ==== KAMPUNG SIBER NETWORK SYSTEM ==== <br />
                  [ SILA PILIH JIRAN DI PANEL KIRI UNTUK MEMULAKAN SAMBUNGAN SEMBANG ]
                </div>
              )}

              {user && jiranDipilih && loadingChat && (
                <div className="text-center text-emerald-600 animate-pulse">[ MEMBUKA DEKRIPSI KOTAK SURAT... ]</div>
              )}

              {user && jiranDipilih && !loadingChat && logMesej.length === 0 && (
                <div className="text-center text-emerald-700 border border-dashed border-emerald-900/60 p-4 bg-emerald-950/10">
                  [ Talian selamat diwujudkan. Belum ada rekod surat layang ditukarkan. ]
                </div>
              )}

              {user && jiranDipilih && !loadingChat && logMesej.map((msg) => {
                const adakahSaya = msg.pengirim_id === user.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[90%] sm:max-w-[85%] space-y-1 ${adakahSaya ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <span className="text-[9px] text-emerald-600 font-bold uppercase">
                      {adakahSaya ? `[ YOU ]` : `[ @${jiranDipilih.username} ]`} — {new Date(msg.created_at).toLocaleTimeString('ms-MY', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <div className={`p-2.5 border leading-relaxed text-[11px] sm:text-[11.5px] break-all ${
                      adakahSaya 
                        ? "bg-emerald-950/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)]" 
                        : "bg-slate-950 border-emerald-800 text-emerald-400"
                    }`}>
                      {msg.mesej}
                    </div>
                  </div>
                );
              })}
              <div ref={hujungSembangRef} />
            </div>

            {/* Kotak Input Penghantaran Mesej */}
            {user && jiranDipilih && (
              <form onSubmit={handleHantarMesej} className="p-3 bg-black border-t border-emerald-800 flex gap-2">
                <div className="text-emerald-500 font-bold font-mono text-xs flex items-center pl-1 select-none">
                  $&gt;
                </div>
                <input 
                  type="text"
                  required
                  placeholder="Taip mesej..."
                  value={teksMesej}
                  onChange={(e) => setTeksMesej(e.target.value)}
                  className="flex-1 bg-black text-emerald-400 placeholder-emerald-900 font-mono text-xs p-2 focus:outline-none focus:ring-0 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="bg-emerald-950 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono font-black border border-emerald-500 text-[10px] uppercase px-3 sm:px-4 py-2 transition-all active:scale-95"
                >
                  SEND
                </button>
              </form>
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