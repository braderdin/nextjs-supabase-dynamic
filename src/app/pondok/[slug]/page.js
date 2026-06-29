"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import MarqueePengumuman from '../../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../../components/MenuNavigasiSiber';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BilikPondokBBS({ params }) {
  // Unwrapping params Next.js 15 cara Client Component yang sah
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // --- STATE UTAMA ---
  const [pondokInfo, setPondokInfo] = useState(null);
  const [senaraiMesej, setSenaraiMesej] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE INPUT PENGGUNA ---
  const [mesejBaru, setMesejBaru] = useState("");
  const [kodSnippet, setKodSnippet] = useState("");
  const [loadingHantar, setLoadingHantar] = useState(false);

  // 1. Ambil Maklumat Pondok & Log Mesej BBS
  useEffect(() => {
    async function muatBilikBBS() {
      try {
        // A. Dapatkan sesi user semasa
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // B. Ambil info pondok berdasarkan slug URL
        const { data: dataPondok, error: errPondok } = await supabase
          .from('pondok')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (errPondok || !dataPondok) {
          setLoading(false);
          return;
        }
        setPondokInfo(dataPondok);

        // C. Ambil senarai mesej perbincangan pondok ini
        const { data: dataMesej, error: errMesej } = await supabase
          .from('pondok_mesej')
          .select('*, warga_profil(username)')
          .eq('pondok_id', dataPondok.id)
          .order('created_at', { ascending: true }); // Gaya BBS klasik memaparkan mesej kronologi dari atas ke bawah

        if (!errMesej && dataMesej) {
          setSenaraiMesej(dataMesej);
        }
      } catch (err) {
        console.error("Gagal memancar isyarat log BBS.", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) muatBilikBBS();
  }, [slug]);

  // 2. Hantar Mesej / Snippet Kod Baru ke Papan Buletin
  async function handleHantarBBS(e) {
    e.preventDefault();
    if (!user || !pondokInfo) return;
    if (!mesejBaru.trim()) {
      alert("⚠️ Sila tulis isi ulasan buletin abangku!");
      return;
    }

    setLoadingHantar(true);

    const { error } = await supabase
      .from('pondok_mesej')
      .insert({
        pondok_id: pondokInfo.id,
        pengirim_id: user.id,
        mesej: mesejBaru,
        kod_snippet: kodSnippet || null
      });

    if (!error) {
      setMesejBaru("");
      setKodSnippet("");
      
      // Ambil semula log mesej terkini untuk segarkan skrin
      const { data } = await supabase
        .from('pondok_mesej')
        .select('*, warga_profil(username)')
        .eq('pondok_id', pondokInfo.id)
        .order('created_at', { ascending: true });
        
      if (data) setSenaraiMesej(data);
    } else {
      alert(`❌ Ralat sistem fail BBS: ${error.message}`);
    }
    setLoadingHantar(false);
  }

  // Paparan jika pondok tidak ditemui dalam database
  if (!loading && !pondokInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900 border-2 border-red-500 p-6 max-w-md shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ PONDOK SIBER GHAIB</p>
          <p className="mb-4">Maaf bang, pondok dengan alamat slug <span className="text-pink-400">"{slug}"</span> tidak ditemui dalam arkib siber.</p>
          <Link href="/pondok" className="inline-block bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 px-4 py-2 transition-all">
            ➔ KEMBALI KE DATARAN PONDOK
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* HEADER BILIK PONDOK */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#3b82f6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="font-mono">
            <span className="text-[10px] text-pink-500 font-bold block mb-1">⛺ LOKASI_SALURAN: /pondok/{slug}</span>
            <h1 className="text-xl md:text-2xl font-black text-yellow-400 uppercase tracking-tight">
              {pondokInfo?.nama}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {pondokInfo?.deskripsi}
            </p>
          </div>
          <Link 
            href="/pondok"
            className="bg-slate-950 border border-slate-700 hover:border-yellow-500 font-mono text-[10px] px-3 py-1.5 uppercase font-bold text-slate-400 hover:text-white transition-all whitespace-nowrap"
          >
            ⬅️ Keluar Bilik
          </Link>
        </div>

        <MenuNavigasiSiber />

        {/* LOG PAPAN BULETIN BBS KLASIK */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#a855f7] flex flex-col">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
            <span>📟 papan_buletin_bbs.log</span>
            <span className="text-[10px] text-purple-400 font-bold tracking-widest">CHRONO_VIEW</span>
          </div>

          <div className="p-4 md:p-6 flex-1 space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {loading && (
              <div className="text-center font-mono text-xs py-8 text-slate-500">
                🔄 Sedang memuat turun log perbincangan siber...
              </div>
            )}

            {!loading && senaraiMesej.length === 0 && (
              <div className="text-center font-mono text-xs py-12 text-slate-600 border border-dashed border-slate-850 bg-slate-950/40">
                [ Log perbincangan masih bersih. Sila tinggalkan buletin/kod siber pertama anda! ]
              </div>
            )}

            {!loading && senaraiMesej.map((msg, indeks) => (
              <div key={msg.id} className="bg-slate-950 border border-slate-850 p-4 font-mono space-y-3 shadow-inner">
                {/* Info Header Mesej */}
                <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-900 pb-2 text-slate-500">
                  <span>
                    POST_ID: <span className="text-purple-400">#00{indeks + 1}</span> | Warga: <span className="text-pink-400 hover:underline">@{msg.warga_profil?.username}</span>
                  </span>
                  <span>
                    {new Date(msg.created_at).toLocaleDateString('ms-MY')} {new Date(msg.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Teks Isi Ulasan */}
                <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                  {msg.mesej}
                </p>

                {/* Snippet Kod Jika Wujud */}
                {msg.kod_snippet && (
                  <div className="mt-3 bg-slate-900 border border-slate-800 p-3 overflow-x-auto rounded-none">
                    <div className="text-[9px] font-bold text-yellow-500 uppercase mb-1.5 select-none tracking-wider">🛠️ Ejen Kod / Shared Snippet:</div>
                    <pre className="text-[11px] font-mono text-emerald-400 leading-normal whitespace-pre">
                      <code>{msg.kod_snippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KOTAK BORANG INPUT POSTING BBS */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308]">
          <div className="bg-slate-800 px-4 py-2 font-mono text-xs text-slate-200 select-none">
            <span>✍️ tulis_buletin_baru.exe</span>
          </div>

          <div className="p-4 md:p-6 font-mono">
            {!user ? (
              <div className="text-center text-[11px] text-slate-500 py-4 bg-slate-950 border border-dashed border-slate-850">
                🔒 Sila log masuk akaun kampung siber di halaman utama untuk memulakan perbincangan.
              </div>
            ) : (
              <form onSubmit={handleHantarBBS} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Isi Ulasan / Pendapat Utama
                  </label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Tulis ulasan, soalan, atau sapaan mesra anda di sini..."
                    value={mesejBaru}
                    onChange={(e) => setMesejBaru(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-yellow-500 placeholder:text-slate-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tepek Snippet Kod HTML / Style CSS (Opsional)
                  </label>
                  <textarea 
                    rows={5}
                    placeholder=""
                    value={kodSnippet}
                    onChange={(e) => setKodSnippet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-yellow-500 placeholder:text-slate-700 resize-none shadow-inner"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loadingHantar}
                  className="w-full bg-slate-950 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-500 font-black py-2.5 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  {loadingHantar ? "⚡ SEDANG MEMANCAR..." : "✍️ SIARKAN BULETIN SIBER"}
                </button>
              </form>
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