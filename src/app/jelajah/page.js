"use client";

import { useState, useEffect } from 'react'; // ➔ Tambah React Hooks
import Link from 'next/link';
import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

export default function JelajahKampung() {
  // --- STATE DATA LIVE ---
  const [wargaSiber, setWargaSiber] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLog, setErrorLog] = useState("");

  // Ambil data direktori R2 secara automatik dari API apabila halaman dibuka
  useEffect(() => {
    async function ambilWargaLive() {
      try {
        const respon = await fetch("/api/warga");
        const hasil = await respon.json();
        
        if (hasil.success) {
          // Bina struktur objek kad secara dinamik mengikut nama folder yang ada di R2
          const dataWarga = hasil.warga.map((nama, indeks) => {
            const senaraiStiker = ["✨", "🏍️", "💻", "🎸", "🛵", "🔥", "🐱", "👾", "📻"];
            const stikerRawak = senaraiStiker[indeks % senaraiStiker.length];
            
            return {
              nama: nama,
              tajuk: `Teratak Siber ${nama}`,
              pelawat: Math.floor(Math.random() * 300) + 15, // Simulasi kaunter roda pelawat comel
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

            {/* 4. PAPARAN GRID DATA DARI CLOUDFLARE R2 */}
            {!loading && !errorLog && (
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