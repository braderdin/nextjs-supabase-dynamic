"use client";

import { useState } from "react";
import Link from "next/link";

export default function KitabGrafik() {
  const [statusSalin, setStatusSalin] = useState("");

  // Koleksi pautan fail GIF retro tulen & stabil dari arkib siber rasmi
  const senaraiGrafik = [
    { nama: "Neon Welcome", url: "https://i.gifer.com/76bS.gif", kategori: "Banner" },
    { nama: "Api Membakar", url: "https://i.gifer.com/XOsX.gif", kategori: "Divider" },
    { nama: "Garis Piksel Cyber", url: "https://i.gifer.com/76Yp.gif", kategori: "Divider" },
    { nama: "Bintang Berkelip", url: "https://i.gifer.com/YV7b.gif", kategori: "Hiasan" },
    { nama: "Kursor Comet", url: "https://i.gifer.com/4Kb7.gif", kategori: "Hiasan" },
    { nama: "Under Construction", url: "https://i.gifer.com/VAyR.gif", kategori: "Banner" },
  ];

  function handleSalinKod(url, nama) {
    const kodHtmlImg = `<img src="${url}" alt="${nama} Retro Graphic" style="display: inline-block; vertical-align: middle;" />`;
    
    navigator.clipboard.writeText(kodHtmlImg);
    setStatusSalin(`🎉 Kod untuk [${nama}] Berjaya Disalin! Sila paste ke Studio Kreatif.`);
    
    setTimeout(() => setStatusSalin(""), 4000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-4 md:p-8 flex flex-col items-center">
      
      {/* KOTAK UTAMA TINGKAP RETRO */}
      <div className="max-w-4xl w-full bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#ec4899] mb-8">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 text-xs text-slate-300 select-none">
          <span>📜 kitab_grafik_retro.sys</span>
          <Link href="/" className="text-pink-400 hover:underline">➔ BALIK KAMPUNG</Link>
        </div>

        <div className="p-6 text-center">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-300 uppercase tracking-wide">
            🏛️ KITAB GRAFIK SIBER RETRO
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Klik pada mana-mana gambar grafik, animas, atau garisan pembahagi di bawah. Sistem akan menyalin kod HTML <code className="text-yellow-400">&lt;img&gt;</code> secara automatik untuk abang tampal ke dalam teratak siber!
          </p>
        </div>

        {/* NOTIFIKASI TOAST BERJAYA SALIN KOD */}
        {statusSalin && (
          <div className="mx-6 p-3 bg-slate-950 border border-pink-500/30 text-emerald-400 text-xs text-center font-bold animate-pulse">
            {statusSalin}
          </div>
        )}

        {/* GRID PERPUSTAKAAN GRAPHIC */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {senaraiGrafik.map((item, indeks) => (
            <div 
              key={indeks}
              onClick={() => handleSalinKod(item.url, item.nama)}
              className="bg-slate-950 border-2 border-slate-800 hover:border-pink-500 p-4 flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-[-2px]"
            >
              <div className="h-20 flex items-center justify-center overflow-hidden select-none">
                <img src={item.url} alt={item.nama} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="w-full text-center border-t border-dashed border-slate-900 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{item.nama}</span>
                <span className="text-[8px] uppercase px-1.5 py-0.5 bg-slate-900 text-yellow-500 font-bold border border-slate-800 inline-block mt-1">{item.kategori}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}