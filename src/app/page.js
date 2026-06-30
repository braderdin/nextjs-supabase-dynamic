"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import MarqueePengumuman from '../components/MarqueePengumuman';
import ButangGoogleLogin from '../components/ButangGoogleLogin';
import MenuNavigasiSiber from '../components/MenuNavigasiSiber';
import TuntutNamaTeratak from '../components/TuntutNamaTeratak';
import PengurusFailGrid from '../components/PengurusFailGrid'; 

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

  const [isEditorTerbuka, setIsEditorTerbuka] = useState(false);
  const [isWhitelistTerbuka, setIsWhitelistTerbuka] = useState(false);

  // =====================================================================
  // Mula: STATE KOTAK SEMBANG DATARAN (SHOUTBOX)
  // =====================================================================
  const [senaraiShout, setSenaraiShout] = useState([]);
  const [shoutNama, setShoutNama] = useState("");
  const [shoutMesej, setShoutMesej] = useState("");
  const [loadingShout, setLoadingShout] = useState(false);
  // =====================================================================
  // Tamat: STATE KOTAK SEMBANG DATARAN (SHOUTBOX)

  async function muatSenaraiFailDaripadaR2(usernameAkaun) {
    setLoadingFailR2(true);
    try {
      const res = await fetch(`/api/files?username=${usernameAkaun}`);
      const data = await res.json();
      if (data.success) setSenaraiFailR2(data.senaraiFail);
    } catch (e) {
      console.error("Gagal menjejaki indeks fail R2.");
    } finally {
      setLoadingFailR2(false);
    }
  }

  async function handlePilihFailDariGrid(fail) {
    if (fail.jenis === 'folder') return;
    setFailAktif({ name: fail.nama, path: fail.laluanFull });
    setLoading(true);
    setStatusR2(`Membuka dekripsi data fail [${fail.laluanFull}]... 📥`);
    setLamanBerjaya("");
    try {
      const res = await fetch(`/api/upload?username=${namaPengguna}&path=${fail.laluanFull}`);
      const data = await res.json();
      if (data.success) {
        setKodHtml(data.kodHtml);
        setStatusR2(`Fail [${fail.nama}] sedia disunting.`);
        setIsEditorTerbuka(true);
      } else {
        setKodHtml(``);
        setStatusR2(`Fail kosong atau gagal dimuat.`);
      }
    } catch (err) {
      setKodHtml(``);
      setStatusR2(`Ralat sambungan fail.`);
    } finally {
      setLoading(false);
    }
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
      const data = await res.json();
      if (!data.success) {
        alert(`❌ Gagal Cipta Item: ${data.message || data.error || "Ralat pelayan"}`);
        return;
      }
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) { alert(`❌ Ralat Sistem Fail: ${e.message}`); }
  }

  async function handlePadamItemFizikal(laluanFullItem) {
    try {
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: namaPengguna, pathFail: laluanFullItem })
      });
      const data = await res.json();
      if (data.success) {
        await muatSenaraiFailDaripadaR2(namaPengguna);
        if (failAktif.path.startsWith(laluanFullItem)) {
          setFailAktif({ name: "index.html", path: "index.html" });
          const resIndex = await fetch(`/api/upload?username=${namaPengguna}&path=index.html`);
          const dataIndex = await resIndex.json();
          if (dataIndex.success) setKodHtml(dataIndex.kodHtml);
        }
      }
    } catch (e) { alert("Ralat memadam objek."); }
  }

  async function ambilPermintaanJiran(usernameAkaun) {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      const { data, error } = await supabase
        .from('ikatan_jiran')
        .select('id, status, pengirim_id, warga_profil(username)')
        .eq('penerima_username', usernameAkaun.toLowerCase())
        .eq('status', 'pending');
      if (!error && data) setPermintaanJiran(data);
    } catch (err) { console.error(err); }
  }

  async function ambilJiranIntim(userId) {
    try {
      const { data, error } = await supabase
        .from('jiran_intim')
        .select('*')
        .eq('user_id', userId)
        .order('slot_kedudukan', { ascending: true });
      if (!error && data) setSenaraiJiranIntim(data);
    } catch (err) { console.error(err); }
  }

  async function handleUrusJiran(idRekod, statusBaru) {
    try {
      const { error } = await supabase.from('ikatan_jiran').update({ status: statusBaru }).eq('id', idRekod);
      if (!error) {
        setPermintaanJiran(prev => prev.filter(item => item.id !== idRekod));
        alert(statusBaru === 'accepted' ? "🤝 Ikatan Rakan Tetangga siber berjaya termaktub!" : "📭 Permohonan jiran ditolak.");
      }
    } catch (err) { console.error(err); }
  }

  async function handleKunciJiranIntim(nomborSlot) {
    const targetUsername = inputSlot[nomborSlot]?.toLowerCase().trim();
    if (!targetUsername) { alert("⚠️ Sila isi nama jiran!"); return; }
    const { data: jiranWujud } = await supabase.from('warga_profil').select('id').eq('username', targetUsername).maybeSingle();
    if (!jiranWujud) { alert(`❌ Teratak @${targetUsername} tiada.`); return; }
    const { error } = await supabase.from('jiran_intim').insert({ user_id: user.id, jiran_username: targetUsername, slot_kedudukan: nomborSlot });
    if (!error) {
      alert(`🎉 @${targetUsername} dikunci pada Slot ${nomborSlot}.`);
      setInputSlot(prev => ({ ...prev, [nomborSlot]: "" }));
      await ambilJiranIntim(user.id);
    } else { alert(error.code === '23505' ? "❌ Slot sudah diisi." : `❌ Ralat: ${error.message}`); }
  }

  async function handlePadamJiranIntim(idRekod) {
    if (!window.confirm("⚠️ Kosongkan slot jiran intim ini?")) return;
    const { error } = await supabase.from('jiran_intim').delete().eq('id', idRekod);
    if (!error) await ambilJiranIntim(user.id);
  }

  // =====================================================================
  // Mula: FUNGSI LOGIK CIPTA & SUBKRIB SHOUTBOX REAL-TIME
  // =====================================================================
  async function ambilDataShoutbox() {
    const { data, error } = await supabase.from('shoutbox').select('*').order('created_at', { ascending: false }).limit(20);
    if (!error && data) setSenaraiShout(data);
  }

  async function handleHantarShout(e) {
    e.preventDefault();
    if (!shoutNama.trim() || !shoutMesej.trim()) return;
    setLoadingShout(true);
    const { error } = await supabase.from('shoutbox').insert({
      nama: shoutNama.replace(/[^a-zA-Z0-9]/g, ""),
      mesej: shoutMesej
    });
    if (!error) {
      setShoutMesej("");
    } else {
      alert("❌ Gagal menjerit di dataran.");
    }
    setLoadingShout(false);
  }
  // =====================================================================
  // Tamat: FUNGSI LOGIK CIPTA & SUBKRIB SHOUTBOX REAL-TIME

  async function semakProfilWarga(currentUser) {
    if (!currentUser) return;
    const { data } = await supabase.from('warga_profil').select('username').eq('id', currentUser.id).maybeSingle();
    if (data) {
      setNamaPengguna(data.username); 
      setHasProfil(true);
      await ambilPermintaanJiran(data.username);
      await ambilJiranIntim(currentUser.id);
      await muatSenaraiFailDaripadaR2(data.username); 
      try {
        const amarahRespon = await fetch(`/api/upload?username=${data.username}&path=index.html`);
        const dataKod = await amaranRespon.json();
        if (dataKod.success && dataKod.kodHtml) setKodHtml(dataKod.kodHtml);
      } catch (err) { console.error(err); }
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
      if (currentUser) {
        await semakProfilWarga(currentUser);
      } else {
        setHasProfil(false); setNamaPengguna(""); setPermintaanJiran([]); setSenaraiJiranIntim([]);
        setKodHtml("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
      }
    });

    ambilDataSupabase();
    ambilWargaR2();
    ambilDataShoutbox();

    // Jalankan frekuensi subskripsi talian real-time Shoutbox
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
    if (!usernameInput || usernameInput.length < 3) { alert("Nama teratak pendek!"); return; }
    setLoadingProfil(true); setErrorProfil("");
    try {
      const { error } = await supabase.from('warga_profil').insert({ id: user.id, username: usernameInput });
      if (error) { setErrorProfil(error.code === '23505' ? "Nama teratak dah diambil warga lain! 😢" : error.message); }
      else {
        setNamaPengguna(usernameInput); setHasProfil(true);
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna: usernameInput, kodHtml, pathFailBaru: "index.html" }),
        });
        await ambilWargaR2(); await muatSenaraiFailDaripadaR2(usernameInput);
      }
    } catch (err) { setErrorProfil("Ralat Sistem: Gagal menuntut nama."); }
    finally { setLoadingProfil(false); }
  }

  async function handleSimpanKeR2(e) {
    if (e) e.preventDefault();
    setLoading(true); setStatusR2(`Sedang mengemaskini fail [${failAktif.path}] ke Cloudflare R2... 🚀`); setLamanBerjaya("");
    try {
      const hantarData = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml, pathFailBaru: failAktif.path }),
      });
      const keputusan = await hantarData.json();
      if (keputusan.success) {
        setStatusR2(`🎉 Berjaya! Fail [${failAktif.name}] selamat dikemaskini.`);
        setLamanBerjaya(namaPengguna.toLowerCase());
        await muatSenaraiFailDaripadaR2(namaPengguna);
      } else { setStatusR2(`❌ Gagal: ${keputusan.message || keputusan.error}`); }
    } catch (error) { setStatusR2(`❌ Ralat Sistem: ${error.message}`); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-3 text-slate-400 select-none">
          <span className="text-pink-500 font-bold">KAMPUNG_SIBER_v1.0</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/jelajah" className="hover:text-white transition-colors">🌐 DIREKTORI</Link>
          <Link href="/kitab" className="hover:text-white transition-colors">📜 KITAB_HTML</Link>
          <Link href="/kitab_grafik" className="hover:text-white transition-colors">🎨 KITAB_GRAFIK</Link>
        </div>
        <ButangGoogleLogin 
          user={user} 
          handleLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
          handleLogout={() => supabase.auth.signOut()} 
        />
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        
        {!user && (
          <div className="space-y-8 text-center font-mono">
            <div className="p-8 bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#ec4899] max-w-2xl mx-auto">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-300 uppercase tracking-widest mb-2">
                🏛️ KAMPUNG SIBER NUSANTARA
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Ekosistem pembinaan teratak digital tanpa kekangan algoritma dan pengiklanan. Bina laman web HTML & CSS tulen anda secara bebas!
              </p>
              <div className="p-3 bg-slate-950 border border-slate-850 text-yellow-400 font-bold text-xs animate-pulse mb-6">
                📡 {mesejDinamik}
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
                  className="bg-slate-950 border-2 border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 font-black px-6 py-3 tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)]"
                >
                  🔑 MASUK & PACAK TERATAK SEKARANG
                </button>
              </div>
            </div>

            <div className="max-w-xl mx-auto p-4 bg-slate-900 border border-slate-800 text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">🌐 Warga Yang Baru Bertukang Kod:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {wargaLive.map((nama, i) => (
                  <Link key={i} href={`/laman/${nama}`} className="p-2 bg-slate-950 border border-slate-850 text-pink-400 hover:border-pink-500 truncate block">
                    @{nama}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {user && !hasProfil && (
          <TuntutNamaTeratak 
            usernameInput={usernameInput} 
            setUsernameInput={setUsernameInput}
            handleCiptaProfil={handleCiptaProfil} 
            loadingProfil={loadingProfil} 
            errorProfil={errorProfil}
          />
        )}

        {user && hasProfil && (
          <div className="space-y-6 animate-fadeIn">
            {isEditorTerbuka && (
              <div className="fixed inset-0 bg-slate-950 z-50 p-4 flex flex-col font-mono animate-fadeIn">
                <div className="bg-slate-900 border-2 border-slate-800 p-3 flex items-center justify-between mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                  <div className="text-xs">
                    🔑 <span className="text-slate-400">Teratak Induk &gt;</span> <span className="text-yellow-400 font-bold">{failAktif.path}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleSimpanKeR2(e)} disabled={loading} className="bg-emerald-600 text-slate-950 font-black px-4 py-1.5 text-xs uppercase hover:bg-emerald-500 flex items-center gap-1 shadow-[2px_2px_0px_0px_#047857] disabled:opacity-50">
                      💾 {loading ? "SEDANG MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                    </button>
                    <button onClick={() => setIsEditorTerbuka(false)} className="bg-slate-800 border border-slate-700 text-slate-300 font-bold px-4 py-1.5 text-xs uppercase hover:text-white">
                      🚪 TUTUP EDITOR
                    </button>
                  </div>
                </div>
                {statusR2 && ( <div className="mb-2 p-2 bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">[SISTEM LOG]: {statusR2}</div> )}
                <div className="flex-1 flex flex-col">
                  <textarea value={kodHtml} onChange={(e) => setKodHtml(e.target.value)} className="w-full flex-1 bg-black text-yellow-300 p-4 font-mono text-xs border-2 border-slate-800 focus:outline-none focus:border-pink-500 resize-none shadow-inner" rows={25} />
                </div>
              </div>
            )}

            {isWhitelistTerbuka && (
              <div className="w-full bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6] font-mono text-xs p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                  <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-wider">📋 DOKUMENTASI FORMAT FAIL SAH</h2>
                  <button type="button" onClick={() => setIsWhitelistTerbuka(false)} className="bg-slate-950 border-2 border-blue-500 text-blue-400 hover:bg-blue-400 hover:text-slate-950 px-4 py-1.5 font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(59,130,246,0.3)]">⬅️ KEMBALI KE WORKSPACE</button>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800 leading-relaxed text-slate-300">
                  <h3 className="text-yellow-400 font-bold uppercase mb-2">⚠️ Mengapa Terdapat Jenis Fail Terhad / Dilarang?</h3>
                  <p className="mb-3">Terataksiber sedang berusaha berkembang secara mampan dengan membenarkan jenis fail web statik murni sahaja...</p>
                </div>
              </div>
            )}

            {!isEditorTerbuka && !isWhitelistTerbuka && (
              <div className="space-y-6">
                <MenuNavigasiSiber />
                <div className="w-full">
                  <PengurusFailGrid senaraiFail={senaraiFailR2} loadingFail={loadingFailR2} onFileSelect={handlePilihFailDariGrid} onCiptaItem={handleCiptaItemFizikal} onPadamItem={handlePadamItemFizikal} namaPengguna={namaPengguna} onShowWhitelist={() => setIsWhitelistTerbuka(true)} />
                </div>
                <div className="p-4 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308] font-mono">
                  <button type="button" disabled={loading || senaraiFailR2.length === 0} onClick={(e) => handleSimpanKeR2(e)} className="w-full bg-slate-950 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-500 font-black py-3 px-4 text-xs tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(234,179,8,0.15)] active:translate-x-0.5 active:translate-y-0.5">
                    {loading ? "📡 SEDANG MEMANCAR DATA..." : `🛰️ SERAH & KUNCI REKOD PROJEK KE PELAYAN (COMMIT: ${failAktif.name.toUpperCase()})`}
                  </button>
                  {statusR2 && ( <div className="mt-3 p-3 bg-slate-950 border border-slate-850 text-slate-400 text-center text-[11px] animate-fadeIn">[SISTEM LOG]: {statusR2}</div> )}
                  {lamanBerjaya && (
                    <div className="mt-2 text-center">
                      <Link href={`/laman/${lamanBerjaya}`} target="_blank" className="inline-block text-[11px] font-bold text-pink-400 hover:underline bg-pink-950/20 px-3 py-1 border border-pink-900/30">🔗 Klik Sini Untuk Melawat Hasil Live Teratak Anda!</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isEditorTerbuka && !isWhitelistTerbuka && (
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-900">
                {permintaanJiran.length > 0 && (
                  <div className="bg-slate-900 border-2 border-slate-800 p-4 shadow-[4px_4px_0px_0px_#3b82f6] font-mono text-xs">
                    <h3 className="text-blue-400 font-bold mb-3">📬 PERMOHONAN JIRAN MASUK ({permintaanJiran.length})</h3>
                    <div className="space-y-2">
                      {permintaanJiran.map(req => (
                        <div key={req.id} className="flex items-center justify-between bg-slate-950 p-2 border border-slate-850">
                          <span>🤝 Warga <b>@{req.warga_profil?.username}</b> ingin memohon untuk menjadi jiran teratak abang.</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleUrusJiran(req.id, 'accepted')} className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-3 py-1 hover:bg-emerald-600 hover:text-black font-bold uppercase text-[10px]">Terima</button>
                            <button onClick={() => handleUrusJiran(req.id, 'rejected')} className="bg-red-950 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-600 hover:text-white uppercase text-[10px]">Tolak</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 border-2 border-slate-800 p-4 shadow-[4px_4px_0px_0px_#ec4899] font-mono text-xs">
                  <h3 className="text-pink-400 font-bold mb-1">💖 PENGURUSAN CARTA JIRAN INTIM (TOP 8)</h3>
                  <p className="text-[10px] text-slate-500 mb-4">Susun dan kunci rakan tetangga abang ke dalam grid paparan 8 slot utama teratak.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }, (_, i) => {
                      const slotNum = i + 1;
                      const jiranKunci = senaraiJiranIntim.find(j => Number(j.slot_kedudukan) === slotNum);
                      return (
                        <div key={slotNum} className="bg-slate-950 border border-slate-850 p-2 flex flex-col justify-between gap-2">
                          <span className="text-[9px] text-slate-600 font-bold">SLOT 0{slotNum}</span>
                          {jiranKunci ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-pink-400 font-bold truncate">@{jiranKunci.jiran_username}</span>
                              <button onClick={() => handlePadamJiranIntim(jiranKunci.id)} className="w-full bg-slate-900 border border-red-900/40 text-red-400 py-1 text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">Kosongkan</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <input type="text" placeholder="nama jiran" value={inputSlot[slotNum] || ""} onChange={(e) => setInputSlot(prev => ({ ...prev, [slotNum]: e.target.value.replace(/[^a-zA-Z0-9]/g, "") }))} className="bg-slate-900 border border-slate-850 px-1 py-0.5 text-[10px] text-white focus:outline-none focus:border-pink-500" />
                              <button onClick={() => handleKunciJiranIntim(slotNum)} className="w-full bg-slate-900 border border-slate-700 text-slate-400 py-1 text-[9px] uppercase hover:border-pink-500 hover:text-pink-400 font-bold">Kunci</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* Mula: 💬 SEGMEN TAMBAHAN FASA 3 - KOTAK SEMBANG DATARAN (SHOUTBOX)     */}
        {/* ===================================================================== */}
        <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6] font-mono text-xs mt-4">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 text-slate-200 select-none">
            <span>🗣️ dataran_shoutbox_global.sys</span>
            <span className="text-[9px] text-blue-400 font-black animate-pulse">📡 FREKUENSI_LIVE_REALTIME</span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Borang Jeritan Warga */}
            <form onSubmit={handleHantarShout} className="space-y-3 bg-slate-950 p-4 border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] text-blue-400 font-bold block uppercase tracking-wider">📢 LAUNGKAN MESEJ ANDA</span>
              <div className="space-y-2 flex-1 pt-1">
                <input 
                  type="text" 
                  maxLength={12}
                  placeholder="Nama / Samaran (A-Z)" 
                  value={shoutNama} 
                  onChange={(e) => setShoutNama(e.target.value)} 
                  required
                  className="w-full bg-slate-900 border border-slate-850 p-2 text-yellow-400 focus:outline-none focus:border-blue-500 placeholder:text-slate-700"
                />
                <textarea 
                  maxLength={100}
                  rows={3}
                  placeholder="Tinggalkan jejak, sapaan, atau url teratak abangku..." 
                  value={shoutMesej} 
                  onChange={(e) => setShoutMesej(e.target.value)} 
                  required
                  className="w-full bg-slate-900 border border-slate-850 p-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-700 resize-none text-[11px]"
                />
              </div>
              <button 
                type="submit" 
                disabled={loadingShout}
                className="w-full bg-blue-950 hover:bg-blue-600 text-blue-400 hover:text-slate-950 font-black py-2 uppercase border border-blue-500 tracking-wider text-[10px]"
              >
                {loadingShout ? "SEDANG MENJERIT..." : "⚡ LAUNGKAN SEKARANG"}
              </button>
            </form>

            {/* Kotak Paparan Skrin Terminal Sembang */}
            <div className="md:col-span-2 bg-black border-2 border-slate-850 p-3 h-[210px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-2 text-[11px]">
              {senaraiShout.length === 0 ? (
                <div className="text-center text-slate-700 py-16">[ Dataran sunyi murni... Jadilah warga pertama yang menegur! ]</div>
              ) : (
                senaraiShout.map((shout) => (
                  <div key={shout.id} className="border-b border-dashed border-slate-900 pb-1.5 last:border-0 leading-relaxed break-all">
                    <span className="text-blue-400 font-bold">[{shout.nama}]</span>: 
                    <span className="text-slate-300 font-sans pl-1.5">{shout.mesej}</span>
                    <span className="text-[8px] text-slate-700 block text-right font-mono">
                      {new Date(shout.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
        {/* ===================================================================== */}
        {/* Tamat: Nombor 3 - Kotak Sembang Dataran (Shoutbox) */}

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}