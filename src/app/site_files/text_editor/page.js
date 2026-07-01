"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BorangStudioKreatif from '../../../components/BorangStudioKreatif';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function CoreEditorWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filename = searchParams.get('filename') || 'index.html';

  const [user, setUser] = useState(null);
  const [namaPengguna, setNamaPengguna] = useState("");
  const [kodHtml, setKodHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusR2, setStatusR2] = useState("");
  const [lamanBerjaya, setLamanBerjaya] = useState("");

  useEffect(() => {
    async function muatKandunganFail(usernameAkaun) {
      setStatusR2("Memuatkan dekripsi data fail... 📥");
      try {
        const res = await fetch(`/api/upload?username=${usernameAkaun}&path=${filename}`);
        const data = await res.json();
        if (data.success) {
          setKodHtml(data.kodHtml);
          setStatusR2("Fail sedia disunting.");
        }
      } catch (err) { setStatusR2("Gagal memuat."); }
      finally { setLoading(false); }
    }

    async function semakSesi() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
        if (data) {
          setNamaPengguna(data.username);
          await muatKandunganFail(data.username);
        } else { router.push("/"); }
      } else { router.push("/"); }
    }
    semakSesi();
  }, [filename]);

  async function handleSimpanKeR2(e) {
    if (e) e.preventDefault();
    setLoading(true); setStatusR2(`Mengunci rekod ke Cloudflare R2... 🚀`); setLamanBerjaya("");
    try {
      const hantarData = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml, pathFailBaru: filename }),
      });
      const keputusan = await hantarData.json();
      if (keputusan.success) {
        setStatusR2(`🎉 Berjaya dikunci masuk.`);
        setLamanBerjaya(namaPengguna.toLowerCase());
      }
    } catch (error) { setStatusR2("Ralat penyimpanan."); }
    finally { setLoading(false); }
  }

  return (
    // Mula: Nombor 3.A - Halaman Workspace Khusus Untuk Editor Teks Sahaja dlm /site_files/text_editor
    <div className="min-h-screen bg-slate-950 p-4 font-mono flex flex-col justify-center max-w-4xl w-full mx-auto gap-4">
      <div className="flex items-center justify-between bg-slate-900/60 p-3 border border-slate-900 shadow-sm rounded-none">
        <div className="text-xs text-slate-400">
          📂 Alamat Fail: <span className="text-emerald-400 font-bold">{filename}</span>
        </div>
        <button onClick={() => router.push("/dashboard")} className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-[11px] px-3 py-1 uppercase rounded-none transition-all">
          🚪 Balik Ke Workspace
        </button>
      </div>

      <BorangStudioKreatif 
        namaPengguna={namaPengguna}
        kodHtml={kodHtml}
        setKodHtml={setKodHtml}
        handleSimpanKeR2={handleSimpanKeR2}
        loading={loading}
        statusR2={statusR2}
        lamanBerjaya={lamanBerjaya}
        failAktif={{ name: filename.split('/').pop(), path: filename }}
      />
    </div>
    // Tamat: Nombor 3.A - Halaman Workspace Khusus Untuk Editor Teks Sahaja dlm /site_files/text_editor
  );
}

export default function TextEditorPage() {
  return (
    // Mula: Pembungkus Suspense Boundary bagi menjamin kestabilan Next.js 15 Build di Vercel
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-slate-500">📡 Memancarkan Frekuensi Editor...</div>}>
      <CoreEditorWorkspace />
    </Suspense>
    // Tamat: Pembungkus Suspense Boundary bagi menjamin kestabilan Next.js 15 Build di Vercel
  );
}