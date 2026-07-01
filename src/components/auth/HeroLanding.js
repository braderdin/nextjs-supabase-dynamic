"use client";

import Link from 'next/link';

export default function HeroLanding({ mesejDinamik, wargaLive = [], onLogin }) {
  return (
    // Mula: Kontena Master Halaman Pendaratan Pelawat Gaya Vercel 2026
    <div className="space-y-6 text-center font-mono animate-fadeIn">
      
      {/* Mula: Bento Kad Utama (Hero Slogan & Akses Masuk) */}
      <div className="p-8 bg-slate-950/40 backdrop-blur-md border border-slate-900 max-w-2xl mx-auto shadow-[0_0_50px_-12px_rgba(236,72,153,0.12)] rounded-none transition-all">
        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 uppercase tracking-widest mb-3 select-none">
          🏛️ KAMPUNG SIBER NUSANTARA
        </h1>
        
        <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-md mx-auto mb-6 font-sans">
          Ekosistem pembinaan teratak digital tanpa kekangan algoritma dan pengiklanan. 
          Bina dan miliki laman web HTML & CSS tulen anda secara bebas selamanya!
        </p>
        
        {/* Isyarat Satelit Kampung */}
        <div className="p-2.5 bg-slate-900/40 border border-slate-900 text-yellow-400/90 font-bold text-[11px] mb-6 rounded-none select-none tracking-tight">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse mr-1.5"></span>
          STATUS_SATELIT: {mesejDinamik}
        </div>
        
        {/* Butang Log Masuk Google Minimalis */}
        <div className="flex justify-center select-none">
          <button 
            onClick={onLogin} 
            className="bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-pink-500/60 text-slate-200 hover:text-pink-400 font-bold px-6 py-3 tracking-wider text-[11px] uppercase transition-all rounded-none active:scale-[0.99] shadow-sm"
          >
            🔑 MASUK & PACAK TERATAK SEKARANG
          </button>
        </div>
      </div>
      {/* Tamat: Bento Kad Utama (Hero Slogan & Akses Masuk) */}

      {/* Mula: Bento Kad Bawah (Senarai Warga Baru) */}
      <div className="max-w-xl mx-auto p-4 bg-slate-950/20 border border-slate-900/60 text-left rounded-none">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2.5 select-none flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
          🌐 Warga Yang Baru Bertukang Kod:
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {wargaLive.length === 0 ? (
            <div className="col-span-full text-slate-700 text-[10px] py-2 font-mono">
              [ Menanti kehadiran warga baru... ]
            </div>
          ) : (
            wargaLive.map((nama, i) => (
              <Link 
                key={i} 
                href={`/laman/${nama}`} 
                className="p-2 bg-slate-900/30 border border-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 truncate block font-mono transition-all text-[11px]"
              >
                @{nama}
              </Link>
            ))
          )}
        </div>
      </div>
      {/* Tamat: Bento Kad Bawah (Senarai Warga Baru) */}

    </div>
    // Tamat: Kontena Master Halaman Pendaratan Pelawat Gaya Vercel 2026
  );
}