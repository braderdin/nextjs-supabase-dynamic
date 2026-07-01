"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';
import PengurusFailGrid from '../../components/PengurusFailGrid'; 
import PengurusanJiranIntim from '../../components/workspace/PengurusanJiranIntim';

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
  
  const [failAktif, setFailAktif] = useState({ name: "index.html", path: "index.html" });
  const [senaraiFailR2, setSenaraiFailR2] = useState([]);
  const [loadingFailR2, setLoadingFailR2] = useState(false);

  const [permintaanJiran, setPermintaanJiran] = useState([]);
  const [senaraiJiranIntim, setSenaraiJiranIntim] = useState([]);
  const [inputSlot, setInputSlot] = useState({}); 
  const [isWhitelistTerbuka, setIsWhitelistTerbuka] = useState(false);

  async function muatSenaraiFailDaripadaR2(usernameAkaun) {
    setLoadingFailR2(true);
    try {
      const res = await fetch(`/api/files?username=${usernameAkaun}`);
      const data = await res.json();
      if (data.success) setSenaraiFailR2(data.senaraiFail);
    } catch (e) { console.error(e); }
    finally { setLoadingFailR2(false); }
  }

  async function handleCiptaItemFizikal(namaItem, jenisItem, laluanFullItem, isiKandungan = "") {
    try {
      const payloadHtml = jenisItem === 'fail' ? (isiKandungan.trim() || ``) : "FOLDER_PLACEHOLDER";
      const pathHantar = jenisItem === 'fail' ? laluanFullItem : `${laluanFullItem}/.keep`;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml: payloadHtml, pathFailBaru: pathHantar }),
      });
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) { alert(e.message); }
  }

  async function handlePadamItemFizikal(laluanFullItem) {
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: namaPengguna, pathFail: laluanFullItem })
      });
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) { alert(e.message); }
  }

  async function ambilPermintaanJiran(usernameAkaun) {
    const { data } = await supabase.from('ikatan_jiran').select('id, status, pengirim_id, warga_profil(username)').eq('penerima_username', usernameAkaun.toLowerCase()).eq('status', 'pending');
    if (data) setPermintaanJiran(data);
  }

  async function ambilJiranIntim(userId) {
    const { data } = await supabase.from('jiran_intim').select('*').eq('user_id', userId).order('slot_kedudukan', { ascending: true });
    if (data) setSenaraiJiranIntim(data);
  }

  async function handleUrusJiran(idRekod, statusBaru) {
    await supabase.from('ikatan_jiran').update({ status: statusBaru }).eq('id', idRekod);
    setPermintaanJiran(prev => prev.filter(item => item.id !== idRekod));
  }

  async function handleKunciJiranIntim(nomborSlot) {
    const targetUsername = inputSlot[nomborSlot]?.toLowerCase().trim();
    if (!targetUsername) return;
    const { data: jiranWujud } = await supabase.from('warga_profil').select('id').eq('username', targetUsername).maybeSingle();
    if (!jiranWujud) { alert("Teratak tiada."); return; }
    await supabase.from('jiran_intim').insert({ user_id: user.id, jiran_username: targetUsername, slot_kedudukan: nomborSlot });
    setInputSlot(prev => ({ ...prev, [nomborSlot]: "" }));
    await ambilJiranIntim(user.id);
  }

  async function handlePadamJiranIntim(idRekod) {
    await supabase.from('jiran_intim').delete().eq('id', idRekod);
    await ambilJiranIntim(user.id);
  }

  async function handleSimpanKeR2(e) {
    if (e) e.preventDefault();
    setLoading(true); setStatusR2(`Mengemaskini pelayan... 🚀`); setLamanBerjaya("");
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
        setStatusR2(`🎉 Berjaya dikemaskini.`);
        setLamanBerjaya(namaPengguna.toLowerCase());
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
        if (data) {
          setNamaPengguna(data.username); setHasProfil(true);
          await ambilPermintaanJiran(data.username);
          await ambilJiranIntim(currentUser.id);
          await muatSenaraiFailDaripadaR2(data.username);
        } else { router.push("/"); }
      } else { router.push("/"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!user || !hasProfil) return <div className="p-8 text-center text-slate-500 font-mono text-xs">🔒 Membuka Enkripsi Sesi Rangkaian...</div>;

  return (
    // Mula: Nombor 4 - Hanya Memaparkan Komponen Kotak Red Zone Workspace Sahaja dlm /dashboard
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col p-4 max-w-5xl w-full mx-auto gap-6 justify-center">
      <MenuNavigasiSiber />
      
      {isWhitelistTerbuka ? (
        <div className="w-full bg-slate-900 border border-slate-800 p-6 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-blue-400 font-bold">📋 DOKUMENTASI FORMAT FAIL</h2>
            <button onClick={() => setIsWhitelistTerbuka(false)} className="text-slate-400 hover:text-white">[ TUTUP ]</button>
          </div>
          <p className="text-slate-400">Terataksiber membenarkan jenis fail statik murni sahaja demi mampan ekosistem.</p>
        </div>
      ) : (
        <>
          <div className="w-full">
            <PengurusFailGrid senaraiFail={senaraiFailR2} loadingFail={loadingFailR2} onFileSelect={() => {}} onCiptaItem={handleCiptaItemFizikal} onPadamItem={handlePadamItemFizikal} namaPengguna={namaPengguna} onShowWhitelist={() => setIsWhitelistTerbuka(true)} />
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-none font-mono text-xs space-y-3">
            <button type="button" disabled={loading || senaraiFailR2.length === 0} onClick={(e) => handleSimpanKeR2(e)} className="w-full bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 py-3 font-bold uppercase transition-all tracking-wider">
              {loading ? "📡 SEDANG MEMANCAR DATA..." : `🛰️ SERAH & KUNCI REKOD PROJEK KE PELAYAN (MASTER COMMIT)`}
            </button>
            {statusR2 && <div className="p-2 text-slate-500 text-center text-[11px] font-mono">{statusR2}</div>}
            {lamanBerjaya && (
              <div className="text-center">
                <Link href={`/laman/${lamanBerjaya}`} target="_blank" className="text-pink-400 hover:underline">🔗 Melawat Hasil Live Teratak Anda</Link>
              </div>
            )}
          </div>

          {permintaanJiran.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 p-4 font-mono text-xs">
              <h3 className="text-blue-400 font-bold mb-2">📬 PERMOHONAN JIRAN ({permintaanJiran.length})</h3>
              {permintaanJiran.map(req => (
                <div key={req.id} className="flex justify-between items-center bg-slate-950 p-2 border border-slate-900 mt-2">
                  <span>@{req.warga_profil?.username} ingin berjiran.</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleUrusJiran(req.id, 'accepted')} className="text-emerald-400 font-bold">[ Terima ]</button>
                    <button onClick={() => handleUrusJiran(req.id, 'rejected')} className="text-red-400">[ Tolak ]</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <PengurusanJiranIntim senaraiJiranIntim={senaraiJiranIntim} inputSlot={inputSlot} setInputSlot={setInputSlot} handlePadamJiranIntim={handlePadamJiranIntim} handleKunciJiranIntim={handleKunciJiranIntim} />
        </>
      )}
    </div>
    // Tamat: Nombor 4 - Hanya Memaparkan Komponen Kotak Red Zone Workspace Sahaja dlm /dashboard
  );
}