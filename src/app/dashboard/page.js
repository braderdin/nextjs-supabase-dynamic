"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';
import PengurusFailGrid from '../../components/PengurusFailGrid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardWorkspace() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasProfil, setHasProfil] = useState(false); 
  const [namaPengguna, setNamaPengguna] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusR2, setStatusR2] = useState("");
  const [lamanBerjaya, setLamanBerjaya] = useState("");
  
  // Mula: Keadaan State Untuk Pengurus Fail Cloudflare R2
  const [failAktif, setFailAktif] = useState({ name: "index.html", path: "index.html" });
  const [senaraiFailR2, setSenaraiFailR2] = useState([]);
  const [loadingFailR2, setLoadingFailR2] = useState(false);
  const [isWhitelistTerbuka, setIsWhitelistTerbuka] = useState(false);
  // Tamat: Keadaan State Untuk Pengurus Fail Cloudflare R2

  // Mula: Fungsi Memuatkan Indeks Struktur Fail dari Cloudflare R2
  async function muatSenaraiFailDaripadaR2(usernameAkaun) {
    setLoadingFailR2(true);
    try {
      const res = await fetch(`/api/files?username=${usernameAkaun}`);
      const data = await res.json();
      if (data.success) setSenaraiFailR2(data.senaraiFail);
    } catch (e) { console.error("Gagal menjejaki indeks fail R2."); }
    finally { setLoadingFailR2(false); }
  }
  // Tamat: Fungsi Memuatkan Indeks Struktur Fail dari Cloudflare R2

  // Mula: Fungsi Mencipta Fail / Folder Baru dlam VFS R2
  async function handleCiptaItemFizikal(namaItem, jenisItem, laluanFullItem, isiKandungan = "") {
    try {
      const payloadHtml = jenisItem === 'fail' ? (isiKandungan.trim() || ``) : "FOLDER_PLACEHOLDER";
      const pathHantar = jenisItem === 'fail' ? laluanFullItem : `${laluanFullItem}/.keep`;
      await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml: payloadHtml, pathFailBaru: pathHantar }),
      });
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) { console.error(e); }
  }
  // Tamat: Fungsi Mencipta Fail / Folder Baru dlam VFS R2

  // Mula: Fungsi Memadam Objek / Fail dari Baldi R2
  async function handlePadamItemFizikal(laluanFullItem) {
    try {
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: namaPengguna, pathFail: laluanFullItem })
      });
      const data = await res.json();
      if (data.success) { await muatSenaraiFailDaripadaR2(namaPengguna); }
    } catch (e) { console.error(e); }
  }
  // Tamat: Fungsi Memadam Objek / Fail dari Baldi R2

  // Mula: Fungsi Kunci & Serah Kommit Projek Ke Pelayan R2
  async function handleSimpanKeR2(e) {
    if (e) e.preventDefault();
    setLoading(true); setStatusR2(`Mengunci master kommit projek ke pelayan... 🚀`); setLamanBerjaya("");
    try {
      const res = await fetch(`/api/upload?username=${namaPengguna}&path=${failAktif.path}`);
      const dataEx = await res.json();
      const payloadHtml = dataEx.success ? dataEx.kodHtml : "<h1>Teratak Baru</h1>";
      
      const hantarData = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml: payloadHtml, pathFailBaru: failAktif.path }),
      });
      const keputusan = await hantarData.json();
      if (keputusan.success) {
        setStatusR2(`🎉 Berjaya! Seluruh fail projek disahkan selamat.`);
        setLamanBerjaya(namaPengguna.toLowerCase());
        await muatSenaraiFailDaripadaR2(namaPengguna);
      }
    } catch (error) { setStatusR2("Ralat."); }
    finally { setLoading(false); }
  }
  // Tamat: Fungsi Kunci & Serah Kommit Projek Ke Pelayan R2

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
        if (data) {
          setNamaPengguna(data.username); 
          setHasProfil(true);
          await muatSenaraiFailDaripadaR2(data.username);
        } else { router.push("/"); }
      } else { router.push("/"); }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!user || !hasProfil) return <div className="p-8 text-center text-slate-500 font-mono text-xs">🔒 Menyemak Isyarat Sesi Komuniti...</div>;

  return (
    // Mula: Nombor 1 & 3 - Reka Bentuk Halaman /dashboard Memaparkan Fungsi Penuh Kotak Kuning
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col p-4 max-w-5xl w-full mx-auto gap-6 justify-center">
      
      {/* Komponen Navigasi Dua Baris */}
      <MenuNavigasiSiber />
      
      {isWhitelistTerbuka ? (
        <div className="w-full bg-slate-900 border border-slate-800 font-mono text-xs p-6 space-y-4 rounded-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-blue-400 font-bold uppercase">📋 DOKUMENTASI FORMAT FAIL SAH</h2>
            <button type="button" onClick={() => setIsWhitelistTerbuka(false)} className="text-slate-400 hover:text-white font-bold">[ BALIK ]</button>
          </div>
          <p className="text-slate-400">Terataksiber membenarkan jenis fail web statik murni sahaja demi kelancaran ekosistem.</p>
        </div>
      ) : (
        <>
          {/* Nombor 3: Komponen Pengurus Fail Grid (Bento Asset Manager) */}
          <div className="w-full">
            <PengurusFailGrid 
              senaraiFail={senaraiFailR2} 
              loadingFail={loadingFailR2} 
              onFileSelect={() => {}} 
              onCiptaItem={handleCiptaItemFizikal} 
              onPadamItem={handlePadamItemFizikal} 
              namaPengguna={namaPengguna} 
              onShowWhitelist={() => setIsWhitelistTerbuka(true)} 
            />
          </div>

          {/* Nombor 3: Butang Serah & Kunci Rekod Projek (Master Commit) */}
          <div className="p-4 bg-slate-900 border border-slate-800 font-mono rounded-none">
            <button 
              type="button" 
              disabled={loading || senaraiFailR2.length === 0} 
              onClick={(e) => handleSimpanKeR2(e)} 
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold py-3 px-4 text-xs tracking-widest uppercase transition-all rounded-none"
            >
              {loading ? "📡 SEDANG MEMANCAR DATA..." : `🛰️ SERAH & KUNCI REKOD PROJEK KE PELAYAN (MASTER COMMIT)`}
            </button>
            {statusR2 && <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">[LOG]: {statusR2}</div>}
            {lamanBerjaya && (
              <div className="mt-2 text-center select-none">
                <Link href={`/laman/${lamanBerjaya}`} target="_blank" className="text-[11px] font-bold text-pink-400 hover:underline">🔗 Klik Sini Untuk Melawat Hasil Live Teratak Anda!</Link>
              </div>
            )}
          </div>
        </>
      )}
      
    </div>
    // Tamat: Nombor 1 & 3 - Reka Bentuk Halaman /dashboard Memaparkan Fungsi Penuh Kotak Kuning
  );
}