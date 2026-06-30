"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Mula: PEMBAIKAN JITU - Import Supabase Client untuk pengesanan sesi dinamik
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Tamat: PEMBAIKAN JITU - Import Supabase Client untuk pengesanan sesi dinamik

export default function MenuNavigasiSiber() {
  const pathname = usePathname();
  // Mula: PEMBAIKAN JITU - State untuk menyimpan nama pengguna aktif secara dinamik
  const [namaWargaAktif, setNamaWargaAktif] = useState("");

  useEffect(() => {
    async function jejakiSesiWarga() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profil } = await supabase
            .from('warga_profil')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profil) {
            setNamaWargaAktif(profil.username.toLowerCase());
          }
        }
      } catch (ralatSesi) {
        console.error("Gagal menjejaki identiti warga untuk menu siber:", ralatSesi);
      }
    }
    jejakiSesiWarga();
  }, []);
  // Tamat: PEMBAIKAN JITU - State untuk menyimpan nama pengguna aktif secara dinamik

  // Mula: Susunan Menu Baharu Ikut Pelan Baris & Kotak Aktiviti Terbaru abangku
  const senaraiMenu = [
    { nama: "🏠 Teraju Utama", pautan: "/" },
    // Mula: PEMBAIKAN JITU - Mengubah pautan hardcoded abangdin kepada laluan dinamik warga siber aktif
    { nama: "🚀 Laman Saya", pautan: namaWargaAktif ? `/laman/${namaWargaAktif}` : "/#tuntut-teratak" },
    // Tamat: PEMBAIKAN JITU - Mengubah pautan hardcoded abangdin kepada laluan dinamik warga siber aktif
    { nama: "📨 Surat Layang", pautan: "/surat-layang" },
    { nama: "🌐 Jelajah Kampung", pautan: "/jelajah" },
    { nama: "⛺ Pondok Siber", pautan: "/pondok" },
    { nama: "📢 Aktiviti Terbaru", pautan: "/activity" },
    { nama: "📜 Kitab HTML", pautan: "/kitab" },
    { nama: "🎨 Kitab Grafik", pautan: "/kitab_grafik" },
    { nama: "📋 Format Fail Sah", pautan: "/DOKUMENTASI_FORMAT_FAIL_SAH" },
  ];
  // Tamat: Susunan Menu Baharu Ikut Pelan Baris & Kotak Aktiviti Terbaru abangku

  return (
    <nav className="w-full bg-slate-900 border-2 border-slate-800 p-2 shadow-[4px_4px_0px_0px_#ec4899]">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 font-mono text-xs">
        
        {/* Mula: Label Panduan Induk System CRT */}
        <div className="bg-slate-950 px-3 py-1.5 text-pink-400 font-bold border border-slate-800 text-center md:text-left select-none">
          🧭 MENU_UTAMA.SYS :
        </div>
        {/* Tamat: Label Panduan Induk System CRT */}
        
        {/* Mula: Grid Pembahagi Navigasi Komuniti */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap flex-1 gap-2">
          {senaraiMenu.map((menu, indeks) => {
            const adakahAktif = pathname === menu.pautan;
            
            return (
              <Link 
                key={indeks}
                href={menu.pautan}
                className={`text-center bg-slate-950 border px-2 sm:px-4 py-2 font-medium transition-all active:scale-[0.98] text-[11px] sm:text-xs truncate ${
                  adakahAktif 
                    ? "text-pink-500 border-pink-500 bg-pink-950/20 font-bold shadow-[inner_0px_0px_8px_rgba(236,72,153,0.2)]" 
                    : "text-slate-300 border-slate-800 hover:border-pink-500/50 hover:text-pink-400"
                }`}
              >
                {menu.nama}
              </Link>
            );
          })}
        </div>
        {/* Tamat: Grid Pembahagi Navigasi Komuniti */}
        
      </div>
    </nav>
  );
}