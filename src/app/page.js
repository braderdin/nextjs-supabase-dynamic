"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarqueePengumuman from '../components/MarqueePengumuman';
import ButangGoogleLogin from '../components/ButangGoogleLogin';
import HeroLanding from '../components/auth/HeroLanding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [wargaLive, setWargaLive] = useState([]);    
  const [mesejDinamik, setMesejDinamik] = useState("Menghubung satelit Supabase... 📡");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function ambilWargaR2() {
      try {
        const respon = await fetch("/api/warga");
        const hasil = await respon.json();
        if (hasil.success) setWargaLive(hasil.warga.slice(0, 5)); 
      } catch (err) { console.error(err); }
    }

    async function ambilDataSupabase() {
      const { data: projek_data } = await supabase.from('projek_data').select('*');
      if (projek_data && projek_data[0]) setMesejDinamik(projek_data[0].mesej);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      // Mula: Sekiranya pengguna sah dikesan, auto-hala aliran masuk ke /dashboard
      if (currentUser) {
        router.push("/dashboard");
      }
      // Tamat: Sekiranya pengguna sah dikesan, auto-hala aliran masuk ke /dashboard
    });

    ambilDataSupabase();
    ambilWargaR2();
    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) return <div className="p-8 text-center font-mono text-xs text-slate-500">📡 Menyaring Isyarat Gatekeeper...</div>;

  return (
    // Mula: Bertindak Sebagai Pintu Gerbang Utama Rangkaian Kampung
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between font-mono text-[11px] select-none">
        <span className="text-pink-500 font-bold">KAMPUNG_SIBER_GATEWAY</span>
        <ButangGoogleLogin 
          user={user} 
          handleLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
          handleLogout={() => supabase.auth.signOut()} 
        />
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        {!user && (
          <HeroLanding 
            mesejDinamik={mesejDinamik} 
            wargaLive={wargaLive} 
            onLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
          />
        )}
      </div>
    </div>
    // Tamat: Bertindak Sebagai Pintu Gerbang Utama Rangkaian Kampung
  );
}