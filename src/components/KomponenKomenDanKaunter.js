"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function KomponenKomenDanKaunter({ namaPengguna }) {
  const [hit, setHit] = useState(0);
  const [senaraiKomen, setSenaraiKomen] = useState([]);
  const [nama, setNama] = useState("");
  const [ucapan, setUcapan] = useState("");
  const [loadingKomen, setLoadingKomen] = useState(false);

  // 1. Ambil & Naikkan Angka Kaunter Pelawat via RPC Function secara automatik
  async function urusKaunterHit() {
    try {
      const { data, error } = await supabase.rpc("tambah_hit", { target_username: namaPengguna.toLowerCase() });
      if (!error && data) {
        setHit(data);
      } else {
        // Fallback: Ambil data biasa jika fungsi RPC belum sedia
        const { data: selectData } = await supabase
          .from("kaunter_pelawat")
          .select("jumlah_hit")
          .eq("username", namaPengguna.toLowerCase())
          .maybeSingle();
        if (selectData) setHit(selectData.jumlah_hit);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 2. Ambil Senarai Buku Pelawat dari Supabase
  async function ambilBukuPelawat() {
    const { data, error } = await supabase
      .from("buku_pelawat")
      .select("*")
      .eq("username_tuan_tanah", namaPengguna.toLowerCase())
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSenaraiKomen(data);
    }
  }

  useEffect(() => {
    if (namaPengguna) {
      urusKaunterHit();
      ambilBukuPelawat();
    }
  }, [namaPengguna]);

  // 3. Hantar Komen Baru Ke Pangkalan Data Supabase
  async function handleHantarKomen(e) {
    e.preventDefault();
    if (!nama || !ucapan) return;
    setLoadingKomen(true);
    const { error } = await supabase
      .from("buku_pelawat")
      .insert({
        username_tuan_tanah: namaPengguna.toLowerCase(),
        nama_pelawat: nama,
        ucapan_pelawat: ucapan
      });
    if (!error) {
      setNama("");
      setUcapan("");
      await ambilBukuPelawat(); // Segarkan senarai ulasan serta-merta
    }
    setLoadingKomen(false);
  }

  // Menukarkan angka hit menjadi gaya paparan LED klasik (Contoh: 000,124)
  const formatKaunterLED = String(hit).padStart(6, "0");

  return (
    // Mula: Kerangka Pembungkus Translucent 2026 Baru
    <div className="w-full bg-transparent border-t border-slate-900/60 pt-10 pb-16 px-4 font-mono text-xs text-slate-300 select-none">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* ========================================================= */}
        {/* 📊 SEGMEN 4: KAUNTER HIT & LENCANA RASMI (Bento Row)      */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/40 backdrop-blur-md border border-slate-900/80 shadow-sm rounded-none transition-all">
          {/* Rekaan Kotak Kaunter Float Minimalis */}
          <div className="text-center sm:text-left flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">analytics::total_hits</span>
            <div className="inline-block bg-slate-900/40 px-3 py-1 border border-slate-900 text-emerald-400 font-bold text-base tracking-widest">
              {formatKaunterLED}
            </div>
          </div>

          {/* Rekaan Lencana Kacak Kampung Siber 2026 Style */}
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">network::official_badge</span>
            <a href="https://braderdin.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
              <div className="w-[88px] h-[31px] bg-slate-900 border border-slate-800 text-white font-black text-[7px] flex flex-col items-center justify-center uppercase tracking-normal leading-none">
                <span className="text-slate-400">Campung</span>
                <span className="text-[8px] text-pink-500 tracking-tight font-bold">Siber 2026</span>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 📓 SEGMEN 3: BUKU PELAWAT KAMPUNG (Bento Guestbook)       */}
        {/* ========================================================= */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-5 sm:p-6 shadow-sm rounded-none transition-all">
          <div className="border-b border-slate-900/60 pb-3 mb-4 select-none">
            <h3 className="text-blue-400 font-bold text-[12px] uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Warga Guestbook Terminal
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Sila tinggalkan salam digital atau ucapan ikhlas anda di teratak ini.</p>
          </div>

          {/* Borang Input Jejak Digital Inline Style */}
          {/* Mula: PEMBAIKAN JITU - Menyembuhkan ralat ReferenceError handleHantarComen & setUbatan */}
          <form onSubmit={handleHantarKomen} className="space-y-3 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input 
                type="text" 
                placeholder="Nama / Samaran abangku"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="sm:col-span-1 bg-slate-900/40 border border-slate-900 p-2 text-xs text-white focus:outline-none focus:border-slate-800 focus:bg-slate-950 placeholder:text-slate-700 font-mono rounded-none transition-colors"
              />
              <input 
                type="text" 
                placeholder="Tulis ucapan comel atau salam di sini..."
                value={ucapan}
                onChange={(e) => setUcapan(e.target.value)}
                required
                className="sm:col-span-2 bg-slate-900/40 border border-slate-900 p-2 text-xs text-white focus:outline-none focus:border-slate-800 focus:bg-slate-950 placeholder:text-slate-700 font-mono rounded-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loadingKomen}
              className="w-full bg-slate-900 hover:bg-blue-950/40 border border-slate-900 hover:border-blue-900/60 text-blue-400 hover:text-blue-300 font-bold text-[10px] uppercase py-2 tracking-wider transition-all rounded-none disabled:opacity-40 active:scale-[0.99]"
            >
              {loadingKomen ? "⏳ SEDANG MENCATAT..." : "✍️ CATAT JEJAK DIGITAL"}
            </button>
          </form>
          {/* Tamat: PEMBAIKAN JITU - Menyembuhkan ralat ReferenceError handleHantarComen & setUbatan */}

          {/* Senarai Komen Warga Terminal Style */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent pr-0.5">
            {senaraiKomen.length === 0 ? (
              <p className="text-center text-slate-600 text-[10px] py-6 select-none font-mono">[ Belum ada jejak ditinggalkan. Jadi yang pertama! ]</p>
            ) : (
              senaraiKomen.map((komen) => (
                <div key={komen.id} className="bg-slate-950/40 border border-slate-900/60 p-3 leading-relaxed rounded-none transition-all hover:border-slate-900">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase border-b border-slate-900/40 pb-1.5 mb-1.5 select-none text-slate-500">
                    <span className="text-pink-400/90 font-mono">📡 {komen.nama_pelawat}</span>
                    <span className="font-mono text-slate-600">{new Date(komen.created_at).toLocaleDateString('ms-MY')}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-mono leading-normal break-all">{komen.ucapan_pelawat}</p>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Tamat: SEGMEN BUKU PELAWAT */}

      </div>
    </div>
  );
}