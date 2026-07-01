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
    // Mula: Transformasi Navigasi Gaya Vercel Minimalis 2026
    <nav className="w-full bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-1.5 rounded-none shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)]">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 font-mono text-xs">
        
        {/* Mula: Label Teks Murni Tanpa Kotak Border Tebal */}
        <div className="text-slate-500 font-bold px-2 py-1 text-center lg:text-left select-none text-[11px] tracking-wider uppercase flex items-center justify-center lg:justify-start gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500/80 animate-pulse"></span>
          system_nav::
        </div>
        {/* Tamat: Label Teks Murni Tanpa Kotak Border Tebal */}
        
        {/* Mula: Grid Pembahagi Navigasi Komuniti Teks Murni */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1 flex-1">
          {senaraiMenu.map((menu, indeks) => {
            const adakahAktif = pathname === menu.pautan;
            
            return (
              <Link 
                key={indeks}
                href={menu.pautan}
                className={`text-center px-3 py-1.5 font-medium text-[11px] transition-all rounded-none border border-transparent select-none active:scale-[0.98] ${
                  adakahAktif 
                    ? "text-white bg-slate-900/90 border-slate-800/80 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.4)]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                {menu.nama}
              </Link>
            );
          })}
        </div>
        {/* Tamat: Grid Pembahagi Navigasi Komuniti Teks Murni */}
        
      </div>
    </nav>
    // Tamat: Transformasi Navigasi Gaya Vercel Minimalis 2026
  );
}