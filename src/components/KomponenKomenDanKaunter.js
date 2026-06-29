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
    <div className="w-full bg-[#030712] border-t-4 border-double border-slate-800 pt-12 pb-16 px-4 font-mono text-xs text-slate-300 select-none">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* ========================================================= */}
        {/* 📊 SEGMEN 4: KAUNTER HIT & LENCANA RASMI                   */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-slate-900 border-2 border-slate-850">
          {/* Rekaan Kotak Kaunter LED Hijau */}
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">📟 Jumlah Hit Pelawat:</span>
            <div className="inline-block bg-black px-3 py-1.5 border border-slate-800 text-emerald-400 font-black text-lg tracking-widest shadow-inner">
              {formatKaunterLED}
            </div>
          </div>

          {/* Rekaan Lencana Kacak Kampung Siber (88x31 px Standard Retro GeoCities) */}
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">🏅 Lencana Kampung:</span>
            <a href="https://braderdin.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-105 transition-transform">
              <div className="w-[88px] h-[31px] bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 text-white font-black text-[7px] flex flex-col items-center justify-center border border-white uppercase tragedy-none leading-none shadow shadow-pink-500/20">
                <span>Kampung</span>
                <span className="text-[8px] text-yellow-300 tracking-tighter">Siber Retro</span>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 📓 SEGMEN 3: BUKU PELAWAT KAMPUNG (GUESTBOOK)             */}
        {/* ========================================================= */}
        <div className="bg-slate-900 border-2 border-slate-850 p-6 shadow-[4px_4px_0px_0px_#3b82f6]">
          <div className="border-b border-dashed border-slate-800 pb-3 mb-4">
            <h3 className="text-blue-400 font-black text-sm uppercase">📓 BUKU PELAWAT TERATAK</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Sila tinggalkan jejak digital, salam, atau ucapan ikhlas anda di sini!</p>
          </div>

          {/* Borang Input Jejak Digital */}
          <form onSubmit={handleHantarKomen} className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input 
                type="text" 
                placeholder="Nama / Samaran abangku"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="sm:col-span-1 bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 font-mono"
              />
              <input 
                type="text" 
                placeholder="Tulis ucapan comel atau salam di sini..."
                value={ucapan}
                onChange={(e) => setUcapan(e.target.value)}
                required
                className="sm:col-span-2 bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 font-mono"
              />
            </div>
            <button 
              type="submit"
              disabled={loadingKomen}
              className="w-full bg-slate-950 border border-blue-500 hover:bg-blue-500 hover:text-slate-950 text-blue-400 font-black text-[10px] uppercase py-2 tracking-wider transition-colors disabled:opacity-40"
            >
              {loadingKomen ? "⚡ SEDANG MENCATAT..." : "✍️ CATAT JEJAK DIGITAL"}
            </button>
          </form>

          {/* Senarai Komen Warga */}
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {senaraiKomen.length === 0 ? (
              <p className="text-center text-slate-600 text-[10px] py-4">[ Belum ada jejak ditinggalkan. Jadi yang pertama! ]</p>
            ) : (
              senaraiKomen.map((komen) => (
                <div key={komen.id} className="bg-slate-950 border border-slate-850 p-3 leading-relaxed">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase border-b border-slate-900 pb-1 mb-1.5">
                    <span className="text-pink-400">👤 {komen.nama_pelawat}</span>
                    <span className="text-slate-600">{new Date(komen.created_at).toLocaleDateString('ms-MY')}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono">{komen.ucapan_pelawat}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}