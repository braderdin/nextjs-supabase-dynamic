"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import MarqueePengumuman from '../components/MarqueePengumuman';
import ButangGoogleLogin from '../components/ButangGoogleLogin';
import MenuNavigasiSiber from '../components/MenuNavigasiSiber';
import TuntutNamaTeratak from '../components/TuntutNamaTeratak';
import PengurusFailGrid from '../components/PengurusFailGrid'; 
import PengurusanJiranIntim from '../components/workspace/PengurusanJiranIntim';
import DataranShoutbox from '../components/workspace/DataranShoutbox';
import HeroLanding from '../components/auth/HeroLanding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [user, setUser] = useState(null);
  const [hasProfil, setHasProfil] = useState(false); 
  const [wargaLive, setWargaLive] = useState([]);    
  const [mesejDinamik, setMesejDinamik] = useState("Menghubung satelit Supabase... 📡");
  
  const [usernameInput, setUsernameInput] = useState("");
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [errorProfil, setErrorProfil] = useState("");

  const [namaPengguna, setNamaPengguna] = useState("");
  const [kodHtml, setKodHtml] = useState("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
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

  const [senaraiShout, setSenaraiShout] = useState([]);
  const [shoutNama, setShoutNama] = useState("");
  const [shoutMesej, setShoutMesej] = useState("");
  const [loadingShout, setLoadingShout] = useState(false);

  // Mula: Logik Pengurusan Sistem Fail Storan Cloudflare R2
  async function muatSenaraiFailDaripadaR2(usernameAkaun) {
    setLoadingFailR2(true);
    try {
      const res = await fetch(`/api/files?username=${usernameAkaun}`);
      const data = await res.json();
      if (data.success) setSenaraiFailR2(data.senaraiFail);
    } catch (e) { console.error("Gagal menjejaki indeks fail R2."); }
    finally { setLoadingFailR2(false); }
  }

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
  // Tamat: Logik Pengurusan Sistem Fail Storan Cloudflare R2

  // Mula: Logik Pengurusan Hubungan Kejiranan Supabase Realtime
  async function ambilPermintaanJiran(usernameAkaun) {
    try {
      const { data } = await supabase
        .from('ikatan_jiran')
        .select('id, status, pengirim_id, warga_profil(username)')
        .eq('penerima_username', usernameAkaun.toLowerCase())
        .eq('status', 'pending');
      if (data) setPermintaanJiran(data);
    } catch (err) { console.error(err); }
  }

  async function ambilJiranIntim(userId) {
    try {
      const { data } = await supabase
        .from('jiran_intim')
        .select('*')
        .eq('user_id', userId)
        .order('slot_kedudukan', { ascending: true });
      if (data) setSenaraiJiranIntim(data);
    } catch (err) { console.error(err); }
  }

  async function handleUrusJiran(idRekod, statusBaru) {
    try {
      await supabase.from('ikatan_jiran').update({ status: statusBaru }).eq('id', idRekod);
      setPermintaanJiran(prev => prev.filter(item => item.id !== idRekod));
    } catch (err) { console.error(err); }
  }

  async function handleKunciJiranIntim(nomborSlot) {
    const targetUsername = inputSlot[nomborSlot]?.toLowerCase().trim();
    if (!targetUsername) return;
    const { data: jiranWujud } = await supabase.from('warga_profil').select('id').eq('username', targetUsername).maybeSingle();
    if (!jiranWujud) { alert(`❌ Teratak @${targetUsername} tiada.`); return; }
    const { error } = await supabase.from('jiran_intim').insert({ user_id: user.id, jiran_username: targetUsername, slot_kedudukan: nomborSlot });
    if (!error) {
      setInputSlot(prev => ({ ...prev, [nomborSlot]: "" }));
      await ambilJiranIntim(user.id);
    } else { alert("❌ Slot sudah penuh."); }
  }

  async function handlePadamJiranIntim(idRekod) {
    if (!window.confirm("⚠️ Kosongkan slot jiran intim ini?")) return;
    const { error } = await supabase.from('jiran_intim').delete().eq('id', idRekod);
    if (!error) await ambilJiranIntim(user.id);
  }
  // Tamat: Logik Pengurusan Hubungan Kejiranan Supabase Realtime

  // Mula: Logik Pengurusan Sembang Dataran Shoutbox Global
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
  // Tamat: Logik Pengurusan Sembang Dataran Shoutbox Global

  async function semakProfilWarga(currentUser) {
    if (!currentUser) return;
    const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
    if (data) {
      setNamaPengguna(data.username); 
      setHasProfil(true);
      await ambilPermintaanJiran(data.username);
      await ambilJiranIntim(currentUser.id);
      await muatSenaraiFailDaripadaR2(data.username); 
    } else { setHasProfil(false); }
  }

  async function ambilWargaR2() {
    try {
      const respon = await fetch("/api/warga");
      const hasil = await respon.json();
      if (hasil.success) setWargaLive(hasil.warga.slice(0, 5)); 
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    async function ambilDataSupabase() {
      const { data: projek_data } = await supabase.from('projek_data').select('*');
      if (projek_data && projek_data[0]) setMesejDinamik(projek_data[0].mesej);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) { await semakProfilWarga(currentUser); } 
      else { setHasProfil(false); setNamaPengguna(""); }
    });

    ambilDataSupabase();
    ambilWargaR2();
    ambilDataShoutbox();

    const saluranShout = supabase
      .channel('dataran_shoutbox_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shoutbox' }, (payload) => {
        setSenaraiShout(lama => [payload.new, ...lama].slice(0, 20));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(saluranShout);
    };
  }, []);

  async function handleCiptaProfil(e) {
    e.preventDefault();
    if (!usernameInput || usernameInput.length < 3) return;
    setLoadingProfil(true); setErrorProfil("");
    try {
      const { error } = await supabase.from('warga_profil').insert({ id: user.id, username: usernameInput });
      if (error) { setErrorProfil("Nama teratak sudah diambil warga lain! 😢"); }
      else {
        setNamaPengguna(usernameInput); setHasProfil(true);
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna: usernameInput, kodHtml, pathFailBaru: "index.html" }),
        });
        await ambilWargaR2(); 
        await muatSenaraiFailDaripadaR2(usernameInput);
      }
    } catch (err) { setErrorProfil("Ralat."); }
    finally { setLoadingProfil(false); }
  }

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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between font-mono text-[11px] select-none">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-pink-500 font-bold">KAMPUNG_SIBER_v1.0</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/jelajah" className="hover:text-white transition-colors">🌐 DIREKTORI</Link>
        </div>
        <ButangGoogleLogin 
          user={user} 
          handleLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
          handleLogout={() => supabase.auth.signOut()} 
        />
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        
        {!user && (
          <HeroLanding mesejDinamik={mesejDinamik} wargaLive={wargaLive} onLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} />
        )}

        {user && !hasProfil && (
          <TuntutNamaTeratak usernameInput={usernameInput} setUsernameInput={setUsernameInput} handleCiptaProfil={handleCiptaProfil} loadingProfil={loadingProfil} errorProfil={errorProfil} />
        )}

        {user && hasProfil && (
          <div className="space-y-6 animate-fadeIn">
            {isWhitelistTerbuka ? (
              <div className="w-full bg-slate-900 border border-slate-800 font-mono text-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-blue-400 font-bold uppercase">📋 DOKUMENTASI FORMAT FAIL SAH</h2>
                  <button type="button" onClick={() => setIsWhitelistTerbuka(false)} className="text-slate-400 hover:text-white font-bold">📋 BALIK</button>
                </div>
                <p className="text-slate-400">Terataksiber membenarkan jenis fail web statik murni sahaja demi kelancaran ekosistem.</p>
              </div>
            ) : (
              // Mula: KEMBALIKAN SEMUA BLOK ASAL DI PAUTAN UTAMA KAMPUNG SIBER (Nombor 1)
              <div className="space-y-6">
                <MenuNavigasiSiber />
                
                {/* Kotak Pengurus Fail */}
                <div className="w-full">
                  <PengurusFailGrid senaraiFail={senaraiFailR2} loadingFail={loadingFailR2} onFileSelect={() => {}} onCiptaItem={handleCiptaItemFizikal} onPadamItem={handlePadamItemFizikal} namaPengguna={namaPengguna} onShowWhitelist={() => setIsWhitelistTerbuka(true)} />
                </div>
                
                {/* Kotak Serah Commit Pelayan */}
                <div className="p-4 bg-slate-900 border border-slate-800 font-mono">
                  <button type="button" disabled={loading || senaraiFailR2.length === 0} onClick={(e) => handleSimpanKeR2(e)} className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold py-3 px-4 text-xs tracking-widest uppercase transition-all">
                    {loading ? "📡 SEDANG MEMANCAR DATA..." : `🛰️ SERAH & KUNCI REKOD PROJEK KE PELAYAN (MASTER COMMIT)`}
                  </button>
                  {statusR2 && <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">[LOG]: {statusR2}</div>}
                  {lamanBerjaya && (
                    <div className="mt-2 text-center">
                      <Link href={`/laman/${lamanBerjaya}`} target="_blank" className="text-[11px] font-bold text-pink-400 hover:underline">🔗 Klik Sini Untuk Melawat Hasil Live Teratak Anda!</Link>
                    </div>
                  )}
                </div>

                {/* Permohonan Jiran Masuk */}
                {permintaanJiran.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 p-4 font-mono text-xs">
                    <h3 className="text-blue-400 font-bold mb-2">📬 PERMOHONAN JIRAN ({permintaanJiran.length})</h3>
                    {permintaanJiran.map(req => (
                      <div key={req.id} className="flex items-center justify-between bg-slate-950 p-2 border border-slate-900 mt-1">
                        <span>🤝 Warga <b>@{req.warga_profil?.username}</b> ingin memohon untuk menjadi jiran.</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleUrusJiran(req.id, 'accepted')} className="text-emerald-400 font-bold">[ Terima ]</button>
                          <button onClick={() => handleUrusJiran(req.id, 'rejected')} className="text-red-400">[ Tolak ]</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Jiran Intim 8 Panel */}
                <PengurusanJiranIntim senaraiJiranIntim={senaraiJiranIntim} inputSlot={inputSlot} setInputSlot={setInputSlot} handlePadamJiranIntim={handlePadamJiranIntim} handleKunciJiranIntim={handleKunciJiranIntim} />
                
                {/* Dataran Shoutbox Global */}
                <DataranShoutbox shoutNama={shoutNama} setShoutNama={setShoutNama} shoutMesej={shoutMesej} setShoutMesej={setShoutMesej} loadingShout={loadingShout} senaraiShout={senaraiShout} handleHantarShout={handleHantarShout} />
              </div>
              // Tamat: KEMBALIKAN SEMUA BLOK ASAL DI PAUTAN UTAMA KAMPUNG SIBER (Nombor 1)
            )}
          </div>
        )}

      </div>
    </div>
  );
}