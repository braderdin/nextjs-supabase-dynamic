"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Import komponen modular abang yang tersusun rapi
import MarqueePengumuman from '../components/MarqueePengumuman';
import KadWargaSiber from '../components/KadWargaSiber';
import KadTeratakPopular from '../components/KadTeratakPopular';
import BorangStudioKreatif from '../components/BorangStudioKreatif';
import ButangGoogleLogin from '../components/ButangGoogleLogin';
import MenuNavigasiSiber from '../components/MenuNavigasiSiber'; // ➔ Kita panggil menu baru di sini

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [user, setUser] = useState(null);
  const [mesejDinamik, setMesejDinamik] = useState("Sedang menarik data dari database... 🔄");
  const [namaPengguna, setNamaPengguna] = useState("");
  const [kodHtml, setKodHtml] = useState("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
  const [loading, setLoading] = useState(false);
  const [statusR2, setStatusR2] = useState("");
  const [lamanBerjaya, setLamanBerjaya] = useState("");

  useEffect(() => {
    async function ambilDataSupabase() {
      const { data: projek_data } = await supabase.from('projek_data').select('*');
      if (projek_data && projek_data[0]) {
        setMesejDinamik(projek_data[0].mesej);
      } else {
        setMesejDinamik("Alamak abangku, data gagal ditarik atau table kosong! 😢");
      }
    }

    async function dapatkanSesiUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    ambilDataSupabase();
    dapatkanSesiUser();

    return () => subscription.unsubscribe();
  }, []);

  async function handleLoginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

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
        setLamanBerjaya(namaPengguna.toLowerCase());
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
      
      <MarqueePengumuman />

      {/* Kontainer Utama: px-4 untuk handphone memberi kelegaan sempadan kiri kanan */}
      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col justify-center gap-6 md:gap-8">
        
        {/* TAJUK UTAMA UTAMA KAMPUNG SIBER (FLEX RESPONSIF MANTAP) */}
        <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#3b82f6]">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 tracking-tight font-mono">
              KAMPUNG SIBER RETRO ✨
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Platform Media Sosial & Pembina Laman Web Komuniti Nusantara v1.0
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto justify-end">
            <ButangGoogleLogin 
              user={user} 
              handleLogin={handleLoginGoogle} 
              handleLogout={handleLogout} 
            />
            <div className="bg-slate-950 border border-emerald-500/30 px-4 py-2 text-center sm:text-right w-full sm:w-auto h-full flex flex-col justify-center rounded-none">
              <span className="text-[10px] font-mono text-orange-400 block tracking-wider uppercase font-bold">📡 Isyarat Supabase:</span>
              <span className="text-xs font-medium text-emerald-400 font-mono block truncate max-w-full sm:max-w-[150px] mx-auto sm:mx-0">"{mesejDinamik}"</span>
            </div>
          </div>
        </div>

        {/* ➔ SYALUM MASUK: KOMPONEN MENU NAVIGASI RESPONSIF BARU */}
        <MenuNavigasiSiber />

        {/* PAPAN KENYATAAN (Otomatis 1 Kolom di HP, 2 Kolom di Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KadWargaSiber />
          <KadTeratakPopular />
        </div>

        {/* STUDIO KREATIF */}
        <BorangStudioKreatif 
          namaPengguna={namaPengguna}
          setNamaPengguna={setNamaPengguna}
          kodHtml={kodHtml}
          setKodHtml={setKodHtml}
          handleSimpanKeR2={handleSimpanKeR2}
          loading={loading}
          statusR2={statusR2}
          lamanBerjaya={lamanBerjaya}
        />

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}