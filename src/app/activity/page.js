"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import MarqueePengumuman from '@/components/MarqueePengumuman';

// Mula: Data Simulasi Aktiviti Warga Kampung Siber (Boleh Dihubungkan ke Table Supabase Nanti)
const DATA_AKTIVITI_MOCK = [
  { id: 1, warga: "abangdin", aksi: "mengemaskini fail", fail: "index.html", masa: "5 minit lepas", likes: 12, komen: [{ pengirim: "gengcoding", teks: "Mantap teratak baru bang!" }] },
  { id: 2, warga: "alif_cyber99", aksi: "menambah grafik animasi baru dari Kitab Grafik", fail: "hiasan.gif", masa: "20 minit lepas", likes: 8, komen: [] },
  { id: 3, warga: "rock_kapak00", aksi: "menyuntik kod muzik latar belakang YouTube", fail: "portfolio.html", masa: "1 jam lepas", likes: 19, komen: [{ pengirim: "sibergirl", teks: "Lagu imbau kenangan lama betul ni baii." }] },
  { id: 4, warga: "matcoding", aksi: "membuka pondok perbincangan siber baharu", fail: "#CSSComel", masa: "2 jam lepas", likes: 5, komen: [] },
  { id: 5, warga: "sibergirl", aksi: "mendaftar nama teratak unik rasmi", fail: "index.html", masa: "5 jam lepas", likes: 15, komen: [] },
  { id: 6, warga: "timbalansiber", aksi: "mengunci kedudukan slot jiran intim baru", fail: "top8_slot.sys", masa: "1 hari lepas", likes: 7, komen: [] },
];
// Tamat: Data Simulasi Aktiviti Warga Kampung Siber

function KandunganUtamaAktiviti() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const halamanSemasa = Number(searchParams.get('page')) || 1;
  
  // State Pengurusan UI
  const [kataKunci, setKataKunci] = useState("");
  const [senaraiAktiviti, setSenaraiAktiviti] = useState(DATA_AKTIVITI_MOCK);
  const [inputKomen, setInputKomen] = useState({});

  // Fungsi Mengendalikan Carian Aktiviti
  const aktivitiDitapis = senaraiAktiviti.filter(item => 
    item.warga.toLowerCase().includes(kataKunci.toLowerCase()) ||
    item.aksi.toLowerCase().includes(kataKunci.toLowerCase()) ||
    item.fail.toLowerCase().includes(kataKunci.toLowerCase())
  );

  // Fungsi Menambah Angka Like Kosmetik
  const handleTekanLike = (id) => {
    setSenaraiAktiviti(prev => prev.map(item => 
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
  };

  // Fungsi Menghantar Komen Baru pada Aktiviti
  const handleHantarKomen = (e, id) => {
    e.preventDefault();
    const teks = inputKomen[id]?.trim();
    if (!teks) return;

    setSenaraiAktiviti(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          komen: [...item.komen, { pengirim: "WargaSiber", teks: teks }]
        };
      }
      return item;
    }));

    setInputKomen(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
      
      {/* Mula: Nombor 1 - Barisan Butang Navigasi Kecil Kanan Atas Pages */}
      <div className="flex justify-between items-center font-mono">
        <span className="text-[10px] text-slate-500 hidden sm:inline">[ LOKASI: PATH://ACTIVITY.LOG ]</span>
        <div className="flex gap-2 ml-auto">
          <Link href="/" className="bg-slate-900 border border-slate-700 hover:border-pink-500 text-slate-300 text-[11px] px-3 py-1.5 font-bold uppercase transition-colors">
            [ Teraju Utama ]
          </Link>
          <Link href="/laman/abangdin" className="bg-slate-900 border border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 text-[11px] px-3 py-1.5 font-bold uppercase transition-colors">
            [ Laman Saya ]
          </Link>
        </div>
      </div>
      {/* Tamat: Nombor 1 - Barisan Butang Navigasi Kecil Kanan Atas Pages */}

      {/* Mula: Nombor 2 - Tajuk Bahasa Melayu & Kolum Carian Tag Input */}
      <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#10b981] font-mono">
        <h1 className="text-xl md:text-2xl font-black text-emerald-400 uppercase tracking-tight">
          📢 Denyutan Aktiviti Terkini Teratak Siber
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau pergerakan warga siber membina, mengemas kini, dan menghias laman web mereka secara live.
        </p>

        {/* Kotak Input Carian Retro */}
        <div className="mt-4 flex gap-2 items-center bg-slate-950 border border-slate-800 p-2">
          <span className="text-yellow-500 text-xs pl-1 font-bold">TAPIS_AKSI:</span>
          <input 
            type="text"
            placeholder="Cari nama warga atau jenis aktiviti (cth: abangdin, muzik)..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className="flex-1 bg-transparent text-xs text-pink-400 placeholder-slate-700 focus:outline-none font-mono"
          />
        </div>
      </div>
      {/* Tamat: Nombor 2 - Tajuk Bahasa Melayu & Kolum Carian Tag Input */}

      {/* Mula: Nombor 3 - Senarai Aktiviti, Post Komen, dan Butang Like */}
      <div className="space-y-4 font-mono">
        {aktivitiDitapis.length === 0 ? (
          <div className="text-center text-xs py-12 border-2 border-dashed border-slate-850 bg-slate-900 text-slate-600">
            [ Tiada rekod denyutan aktiviti ditemui bagi kata kunci tersebut ]
          </div>
        ) : (
          aktivitiDitapis.map((item) => (
            <div key={item.id} className="bg-slate-900 border-2 border-slate-800 p-4 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.2)] space-y-3">
              
              {/* Kepala Suapan Aktiviti */}
              <div className="flex justify-between items-start border-b border-slate-950 pb-2">
                <div className="text-xs text-slate-300">
                  <Link href={`/laman/${item.warga}`} className="text-pink-400 font-bold hover:underline">@{item.warga}</Link>
                  <span className="text-slate-500"> sedang {item.aksi} </span>
                  <span className="text-yellow-400 font-bold">{item.fail}</span>
                </div>
                <span className="text-[10px] text-slate-600 whitespace-nowrap">{item.masa}</span>
              </div>

              {/* Seksyen Interaksi Button Like */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleTekanLike(item.id)}
                  className="bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-400 hover:text-pink-400 text-[10px] px-2 py-1 flex items-center gap-1.5 transition-all"
                >
                  ❤️ Suka ({item.likes})
                </button>
                <span className="text-[10px] text-slate-600">{item.komen.length} ulasan digital</span>
              </div>

              {/* Sub-Senarai Komen yang Ditinggalkan */}
              {item.komen.length > 0 && (
                <div className="bg-slate-950 p-2.5 border border-slate-850 space-y-2 text-[11px]">
                  {item.komen.map((kom, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-blue-400 font-bold">@{kom.pengirim}:</span>
                      <span className="text-slate-400"> {kom.teks}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Borang Input untuk Meninggalkan Komen Baru */}
              <form onSubmit={(e) => handleHantarKomen(e, item.id)} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Tulis ulasan siber atau sapaan mesra..."
                  value={inputKomen[item.id] || ""}
                  onChange={(e) => setInputKomen(prev => ({ ...prev, [item.id]: e.target.value }))}
                  required
                  className="flex-1 bg-slate-950 border border-slate-850 text-[11px] p-2 text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-700"
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
      {/* Tamat: Nombor 3 - Senarai Aktiviti, Post Komen, dan Butang Like */}

      {/* Mula: Nombor 4 - Gaya Bernombor Navigasi Halaman (Pagination) */}
      <div className="flex justify-center items-center gap-2 font-mono text-xs pt-4 border-t-2 border-dashed border-slate-900">
        <span className="text-slate-600 uppercase font-black text-[10px] mr-2">Muka Surat:</span>
        {[1, 2, 3, 4, 5].map((NoPage) => {
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
      {/* Tamat: Nombor 4 - Gaya Bernombor Navigasi Halaman (Pagination) */}

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