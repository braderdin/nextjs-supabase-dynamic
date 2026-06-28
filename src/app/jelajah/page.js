"use client";

import Link from 'next/link';
import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

export default function JelajahKampung() {
  // --- DATA SIMULASI WARGA (Nanti kita akan tarik secara LIVE dari Supabase) ---
  const wargaSiber = [
    { nama: "testabangku", tajuk: "Teratak Ujian Pertama", pelawat: 432, stiker: "✨" },
    { nama: "braderdin", tajuk: "Hub Utama Riding & Coding", pelawat: 310, stiker: "🏍️" },
    { nama: "alif_cyber99", tajuk: "Dunia HTML Geng Utara", pelawat: 145, stiker: "💻" },
    { nama: "rock_kapak00", tajuk: "Galeri Rock Kapak Nostalgia", pelawat: 98, stiker: "🎸" },
    { nama: "mat_kapcai", tajuk: "Laman Rasmi Geng Konvoi", pelawat: 198, stiker: "🛵" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* HEADER HALAMAN */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-yellow-400 uppercase tracking-tight">
            🌐 JELAJAH KAMPUNG SIBER
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Direktori Rasmi Teratak Digital Warga Nusantara. Sila ziarah dan tinggalkan stiker!
          </p>
        </div>

        <MenuNavigasiSiber />

        {/* WINDOW BOX: SENARAI TERATAK WARKAH */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6]">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
            <span>🗂️ direktori_warga_siber.db</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* GRID SISTEM RESPONSIF: 1 Kolom di HP, 2 Kolom di Tablet, 3 Kolom di Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wargaSiber.map((warga, indeks) => (
                <div 
                  key={indeks} 
                  className="bg-slate-950 border-2 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500 transition-all group shadow-[3px_3px_0px_0px_rgba(59,130,246,0.2)]"
                >
                  <div className="font-mono">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                      <span className="text-xs text-pink-400 font-bold">@{warga.nama}</span>
                      <span className="text-sm">{warga.stiker}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                      {warga.tajuk}
                    </h3>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      🔥 {warga.pelawat} Roda Pelawat
                    </span>
                  </div>

                  <Link 
                    href={`/laman/${warga.nama}`}
                    className="mt-4 w-full text-center bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-slate-950 text-slate-300 font-mono text-[11px] py-1.5 font-bold transition-all uppercase"
                  >
                    🚀 Ziarah Teratak
                  </Link>
                </div>
              ))}
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