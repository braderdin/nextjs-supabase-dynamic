"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // ➔ Kita tambah komponen Link Next.js di sini

// Hubungkan kod ke pintu Supabase menggunakan kunci rahsia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  // --- STATE DATA SUPABASE ---
  const [mesejDinamik, setMesejDinamik] = useState("Sedang menarik data dari database... 🔄");
  
  // --- STATE DATA FORM CLOUDFLARE R2 ---
  const [namaPengguna, setNamaPengguna] = useState("");
  const [kodHtml, setKodHtml] = useState("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
  const [loading, setLoading] = useState(false);
  const [statusR2, setStatusR2] = useState("");
  const [lamanBerjaya, setLamanBerjaya] = useState(""); // ➔ State baharu untuk simpan link sukses

  // Ambil data dari Supabase semasa komponen dibuka
  useEffect(() => {
    async function ambilDataSupabase() {
      const { data: projek_data, error } = await supabase
        .from('projek_data')
        .select('*');

      if (projek_data && projek_data[0]) {
        setMesejDinamik(projek_data[0].mesej);
      } else {
        setMesejDinamik("Alamak abangku, data gagal ditarik atau table kosong! 😢");
      }
    }
    ambilDataSupabase();
  }, []);

  // Fungsi hantar kod HTML ke API Route (/api/upload/route.js)
  async function handleSimpanKeR2(e) {
    e.preventDefault();
    if (!namaPengguna || !kodHtml) {
      setStatusR2("Sila isi nama pengguna dan kod HTML abangku! ⚠️");
      setLamanBerjaya("");
      return;
    }
    setLoading(true);
    setStatusR2("Sedang menghantar fail ke Cloudflare R2... 🚀");
    setLamanBerjaya("");

    try {
      const hantarData = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml }),
      });
      const keputusan = await hantarData.json();
      if (keputusan.success) {
        setStatusR2(`🎉 Berjaya! Fail selamat disimpan.`);
        setLamanBerjaya(namaPengguna.toLowerCase()); // ➔ Simpan nama pengguna untuk dijadikan link klik
      } else {
        setStatusR2(`❌ Gagal: ${keputusan.error || keputusan.message}`);
      }
    } catch (error) {
      setStatusR2(`❌ Ralat Sistem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      
      {/* 1. TEKS BERGERAK (MARQUEE 90-AN) */}
      <marquee className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-slate-950 py-1.5 font-mono text-xs font-bold uppercase tracking-widest border-b-2 border-slate-800 text-white">
        ✨ Selamat Datang ke Pusat Siber Komuniti Nusantara • Jumlah Teratak Digital Terkini: 1,240 buah • Pastikan kod HTML anda comel dan kreatif! ✨
      </marquee>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        
        {/* 2. TAJUK UTAMA UTAMA KAMPUNG SIBER */}
        <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#3b82f6]">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 tracking-tight font-mono">
              KAMPUNG SIBER RETRO ✨
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Platform Media Sosial & Pembina Laman Web Komuniti Nusantara v1.0
            </p>
          </div>
          <div className="bg-slate-950 border border-emerald-500/30 px-4 py-2 text-right max-w-xs rounded-none">
            <span className="text-[10px] font-mono text-orange-400 block tracking-wider uppercase font-bold">📡 Isyarat Supabase Live:</span>
            <span className="text-xs font-medium text-emerald-400 font-mono block truncate">"{mesejDinamik}"</span>
          </div>
        </div>

        {/* 3. PAPAN KENYATAAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TINGKAP KIRI: WARGA SIBER BAHARU */}
          <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#ec4899] flex flex-col">
            <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-slate-800 font-mono text-[11px] text-slate-300 select-none">
              <span className="flex items-center gap-1.5">👥 warga_siber_baharu.exe</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              </div>
            </div>
            <div className="p-4 flex-1 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800">
                <span className="text-pink-400 font-bold">➔ braderdin</span>
                <span className="text-slate-500 text-[10px]">Baru mendaftar 🚀</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800">
                <span className="text-blue-400 font-bold">➔ alif_cyber99</span>
                <span className="text-slate-500 text-[10px]">Mengemaskini teratak 📝</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800">
                <span className="text-yellow-400 font-bold">➔ rock_kapak00</span>
                <span className="text-slate-500 text-[10px]">Menambah lagu latar 🎵</span>
              </div>
            </div>
          </div>

          {/* TINGKAP KANAN: TERATAK PALING POPULAR */}
          <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308] flex flex-col">
            <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-slate-800 font-mono text-[11px] text-slate-300 select-none">
              <span className="flex items-center gap-1.5">⭐ teratak_popular.log</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              </div>
            </div>
            <div className="p-4 flex-1 font-mono text-xs space-y-3">
              {/* ➔ Diubah kepada Link komponen yang boleh diklik terus */}
              <Link href="/laman/testabangku" className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 hover:border-yellow-500 transition-colors group">
                <span className="text-slate-200 group-hover:text-yellow-400 underline">1. /laman/testabangku</span>
                <span className="text-emerald-400 text-[10px]">🔥 432 Pelawat</span>
              </Link>
              <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 text-slate-500">
                <span>2. /laman/braderdin</span>
                <span className="text-[10px]">🔥 310 Pelawat</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 text-slate-500">
                <span>3. /laman/mat_kapcai</span>
                <span className="text-[10px]">🔥 198 Pelawat</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. TINGKAP UTAMA: PEMBINA LAMAN WEB COMEL R2 */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#10b981]">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
            <span className="flex items-center gap-2">📝 studio_kreatif_notepad.sys</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-xs text-slate-400 mb-6 font-mono">
              [SILA TAIP KOD DI SINI]: Cipta nama folder dan masukkan struktur HTML/CSS abang di bawah untuk disimpan ke Cloudflare R2 Storan.
            </p>

            <form onSubmit={handleSimpanKeR2} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  📁 NAMA TERATAK (Akan jadi url laman digital anda)
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: braderdin, testabangku"
                  value={namaPengguna}
                  onChange={(e) => setNamaPengguna(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  💾 KOD SUMBER HTML / STYLE CSS
                </label>
                <textarea 
                  rows={9}
                  value={kodHtml}
                  onChange={(e) => setKodHtml(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-none p-4 font-mono text-xs text-yellow-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-mono font-black py-3.5 px-4 text-xs tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
              >
                {loading ? "💾 SEDANG MEMPROSES FAIL..." : "🚀 PUNTAK MASUK KE CLOUDFLARE R2"}
              </button>
            </form>

            {/* Status Log Kemas Kini + Pautan Klik Terus */}
            {statusR2 && (
              <div className="mt-5 text-xs font-mono p-4 bg-slate-950 border-2 border-dashed border-slate-800 text-slate-400 text-center flex flex-col items-center justify-center gap-2">
                <span>[SISTEM LOG]: {statusR2}</span>
                {lamanBerjaya && (
                  <Link 
                    href={`/laman/${lamanBerjaya}`} 
                    target="_blank"
                    className="mt-1 text-xs font-bold text-pink-400 hover:text-pink-300 underline bg-pink-500/10 px-3 py-1 border border-pink-500/20"
                  >
                    👉 Klik Sini Untuk Melawat Teratak Siber Anda!
                  </Link>
                )}
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