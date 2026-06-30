"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import MarqueePengumuman from '@/components/MarqueePengumuman';

function KandunganUtamaAktiviti() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const halamanSemasa = Number(searchParams.get('page')) || 1;
  
  const [kataKunci, setKataKunci] = useState("");
  const [senaraiAktiviti, setSenaraiAktiviti] = useState([]);
  const [totalAktiviti, setTotalAktiviti] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inputKomen, setInputKomen] = useState({});

  // Mula: Fungsi Memanggil Suapan API Aktiviti Supabase secara Dinamik
  async function muatAktivitiLive() {
    setLoading(true);
    try {
      const respon = await fetch(`/api/activity?page=${halamanSemasa}&search=${encodeURIComponent(kataKunci)}`);
      const hasil = await respon.json();
      if (hasil.success) {
        setSenaraiAktiviti(hasil.data || []);
        setTotalAktiviti(hasil.total || 0);
      }
    } catch (err) {
      console.error("Gagal menyaring frekuensi isyarat aktiviti.", err);
    } finally {
      setLoading(false);
    }
  }
  // Tamat: Fungsi Memanggil Suapan API Aktiviti Supabase secara Dinamik

  useEffect(() => {
    muatAktivitiLive();
  }, [halamanSemasa]);

  const handleCarianAktiviti = (e) => {
    e.preventDefault();
    router.push(`/activity?page=1`);
    muatAktivitiLive();
  };

  // Mula: Fungsi Menghantar Isyarat Klik Suka (Like)
  const handleTekanLike = async (id) => {
    try {
      const respon = await fetch("/api/activity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tipe: "like" })
      });
      const hasil = await respon.json();
      if (hasil.success) {
        setSenaraiAktiviti(prev => prev.map(item => 
          item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
        ));
      }
    } catch (e) {
      alert("⚠️ Gagal menghantar isyarat suka abangku.");
    }
  };
  // Tamat: Fungsi Menghantar Isyarat Klik Suka (Like)

  // Mula: Fungsi Menghantar Catatan Ulasan Real-Time
  const handleHantarKomen = async (e, id) => {
    e.preventDefault();
    const teks = inputKomen[id]?.trim();
    if (!teks) return;

    try {
      const respon = await fetch("/api/activity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tipe: "comment", pengirim: "WargaSiber", teks })
      });
      const hasil = await respon.json();
      if (hasil.success) {
        setSenaraiAktiviti(prev => prev.map(item => 
          item.id === id ? { ...item, komen: hasil.komen } : item
        ));
        setInputKomen(prev => ({ ...prev, [id]: "" }));
      }
    } catch (err) {
      alert("⚠️ Gagal mengunci ulasan digital.");
    }
  };
  // Tamat: Fungsi Menghantar Catatan Ulasan Real-Time

  const jumlahHalaman = Math.ceil(totalAktiviti / 5) || 1;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
      
      {/* Bahagian 1: Barisan Butang Navigasi Pantas Kanan Atas */}
      <div className="flex justify-between items-center font-mono">
        <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">[ STATUS: LIVE_DATABASE_FEED ]</span>
        <div className="flex gap-2 ml-auto">
          <Link href="/" className="bg-slate-900 border border-slate-700 hover:border-pink-500 text-slate-300 text-[11px] px-3 py-1.5 font-bold uppercase transition-colors">
            [ Teraju Utama ]
          </Link>
          <Link href="/laman/abangdin" className="bg-slate-900 border border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 text-[11px] px-3 py-1.5 font-bold uppercase transition-colors">
            [ Laman Saya ]
          </Link>
        </div>
      </div>

      {/* Bahagian 2: Tajuk & Kolum Carian Tag Input */}
      <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#10b981] font-mono">
        <h1 className="text-xl md:text-2xl font-black text-emerald-400 uppercase tracking-tight">
          📢 Denyutan Aktiviti Terkini Teratak Siber
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau pergerakan warga siber membina, mengemas kini, dan menghias laman web mereka secara live.
        </p>

        <form onSubmit={handleCarianAktiviti} className="mt-4 flex gap-2 items-center bg-slate-950 border border-slate-800 p-2">
          <span className="text-yellow-500 text-xs pl-1 font-bold">TAPIS_AKSI:</span>
          <input 
            type="text"
            placeholder="Taip perkataan & tekan ENTER atau butang tapis (cth: abangdin, index.html)..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className="flex-1 bg-transparent text-xs text-pink-400 placeholder-slate-700 focus:outline-none font-mono"
          />
          <button type="submit" className="text-[10px] bg-slate-900 border border-slate-700 px-3 py-0.5 text-slate-400 hover:text-white uppercase font-bold transition-all active:scale-95">
            Tapis
          </button>
        </form>
      </div>

      {/* Bahagian 3: Senarai Aktiviti Terkini Warga */}
      <div className="space-y-4 font-mono">
        {loading ? (
          <div className="text-center text-xs py-12 border-2 border-dashed border-slate-850 bg-slate-900 text-slate-500 animate-pulse">
            🔄 Sedang memancar dan menyaring log data Supabase...
          </div>
        ) : senaraiAktiviti.length === 0 ? (
          <div className="text-center text-xs py-12 border-2 border-dashed border-slate-850 bg-slate-900 text-slate-600">
            [ Tiada rekod denyutan aktiviti ditemui dalam arkib kampung ]
          </div>
        ) : (
          senaraiAktiviti.map((item) => (
            <div key={item.id} className="bg-slate-900 border-2 border-slate-800 p-4 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.2)] space-y-3">
              
              <div className="flex justify-between items-start border-b border-slate-950 pb-2">
                <div className="text-xs text-slate-300">
                  <Link href={`/laman/${item.username}`} className="text-pink-400 font-bold hover:underline">@{item.username}</Link>
                  <span className="text-slate-500"> sedang {item.aksi} </span>
                  <span className="text-yellow-400 font-bold">{item.nama_fail}</span>
                </div>
                <span className="text-[10px] text-slate-600 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString('ms-MY')} {new Date(item.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleTekanLike(item.id)}
                  className="bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-400 hover:text-pink-400 text-[10px] px-2 py-1 flex items-center gap-1.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] active:scale-95"
                >
                  ❤️ Suka ({item.likes || 0})
                </button>
                <span className="text-[10px] text-slate-600">{(item.komen || []).length} ulasan digital</span>
              </div>

              {(item.komen || []).length > 0 && (
                <div className="bg-slate-950 p-2.5 border border-slate-850 space-y-2 text-[11px] max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                  {item.komen.map((kom, i) => (
                    <div key={i} className="leading-relaxed border-b border-slate-900 pb-1 last:border-0 last:pb-0">
                      <span className="text-blue-400 font-bold">@{kom.pengirim}:</span>
                      <span className="text-slate-400"> {kom.teks}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={(e) => handleHantarKomen(e, item.id)} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Tulis ulasan siber atau sapaan mesra..."
                  value={inputKomen[item.id] || ""}
                  onChange={(e) => setInputKomen(prev => ({ ...prev, [item.id]: e.target.value }))}
                  required
                  className="flex-1 bg-slate-950 border border-slate-850 text-[11px] p-2 text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-700 font-mono"
                />
                <button 
                  type="submit"
                  className="bg-slate-950 border border-blue-500 text-blue-400 font-bold text-[10px] px-3 uppercase hover:bg-blue-600 hover:text-black transition-colors"
                >
                  Hantar
                </button>
              </form>

            </div>
          ))
        )}
      </div>

      {/* Bahagian 4: Gaya Bernombor Navigasi Halaman (Pagination) */}
      <div className="flex justify-center items-center gap-2 font-mono text-xs pt-4 border-t-2 border-dashed border-slate-900">
        <span className="text-slate-600 uppercase font-black text-[10px] mr-2">Muka Surat:</span>
        {Array.from({ length: jumlahHalaman }, (_, i) => i + 1).map((NoPage) => {
          const adakahAktif = halamanSemasa === NoPage;
          return (
            <button
              key={NoPage}
              onClick={() => router.push(`/activity?page=${NoPage}`)}
              className={`px-3 py-1.5 border font-bold text-[11px] transition-all ${
                adakahAktif
                  ? "bg-yellow-500 text-slate-950 border-yellow-500 shadow-[2px_2px_0px_0px_rgba(234,179,8,0.2)]"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-yellow-500 hover:text-yellow-400"
              }`}
            >
              {NoPage}
            </button>
          );
        })}
      </div>

    </div>
  );
}

export default function HalamanAktivitiKampung() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-slate-500 animate-pulse">
          [ Membaca gelombang isyarat rangkaian teratak... ]
        </div>
      }>
        <KandunganUtamaAktiviti />
      </Suspense>
      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}