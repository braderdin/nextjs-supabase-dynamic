"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';
import DataranShoutbox from '../../components/workspace/DataranShoutbox';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardWorkspace() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasProfil, setHasProfil] = useState(false); 
  
  const [senaraiShout, setSenaraiShout] = useState([]);
  const [shoutNama, setShoutNama] = useState("");
  const [shoutMesej, setShoutMesej] = useState("");
  const [loadingShout, setLoadingShout] = useState(false);

  // Mula: Ambil & Hantar Rekod Sembang Realtime Shoutbox dlam Dashboard
  async function ambilDataShoutbox() {
    const { data } = await supabase.from('shoutbox').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setSenaraiShout(data);
  }

  async function handleHantarShout(e) {
    e.preventDefault();
    if (!shoutNama.trim() || !shoutMesej.trim()) return;
    setLoadingShout(true);
    const { error } = await supabase.from('shoutbox').insert({
      nama: shoutNama.replace(/[^a-zA-Z0-9]/g, ""),
      mesej: shoutMesej
    });
    if (!error) { setShoutMesej(""); }
    setLoadingShout(false);
  }
  // Tamat: Ambil & Hantar Rekod Sembang Realtime Shoutbox dlam Dashboard

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
        if (data) {
          setHasProfil(true);
          await ambilDataShoutbox();
        } else { router.push("/"); }
      } else { router.push("/"); }
    });

    // Jalankan jalinan paip realtime chat updates
    const saluranShout = supabase
      .channel('dashboard_shoutbox_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shoutbox' }, (payload) => {
        setSenaraiShout(lama => [payload.new, ...lama].slice(0, 20));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(saluranShout);
    };
  }, [router]);

  if (!user || !hasProfil) return <div className="p-8 text-center text-slate-500 font-mono text-xs">🔒 Menyemak Isyarat Sesi Komuniti...</div>;

  return (
    // Mula: Nombor 2 & Tanda X Merah - Hanya mengekalkan kotak navigasi dan Dataran Shoutbox murni dlam /dashboard
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col p-4 max-w-5xl w-full mx-auto gap-6 justify-center">
      
      {/* Menu Navigasi Dua Baris Baru */}
      <MenuNavigasiSiber />
      
      {/* Kotak Yang Digaris Kuning: Dataran Shoutbox Global Komuniti */}
      <DataranShoutbox 
        shoutNama={shoutNama}
        setShoutNama={setShoutNama}
        shoutMesej={shoutMesej}
        setShoutMesej={setShoutMesej}
        loadingShout={loadingShout}
        senaraiShout={senaraiShout}
        handleHantarShout={handleHantarShout}
      />
      
    </div>
    // Tamat: Nombor 2 & Tanda X Merah - Hanya mengekalkan kotak navigasi dan Dataran Shoutbox murni dlam /dashboard
  );
}