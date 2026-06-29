"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import MarqueePengumuman from '../components/MarqueePengumuman';
import BorangStudioKreatif from '../components/BorangStudioKreatif';
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

  // 📡 1. Penarik indeks fail real-time dari storan Cloudflare R2
  async function muatSenaraiFailDaripadaR2(usernameAkaun) {
    setLoadingFailR2(true);
    try {
      const res = await fetch(`/api/files?username=${usernameAkaun}`);
      const data = await res.json();
      if (data.success) {
        setSenaraiFailR2(data.senaraiFail);
      }
    } catch (e) {
      console.error("Gagal menjejaki indeks fail R2.");
    } finally {
      setLoadingFailR2(false);
    }
  }

  // 📥 2. Membaca kod kandungan fail fizikal apabila fail di klik di grid UI
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
      } else {
        setKodHtml(``);
        setStatusR2(`Ralat memuat fail.`);
      }
    } catch (err) {
      setKodHtml(``);
      setStatusR2(`Gagal berhubung dengan fail.`);
    } finally {
      setLoading(false);
    }
  }

  // 🛠️ 3. Penciptaan Item Fizikal (Fail kosong / Folder bertutup placeholder .keep)
  async function handleCiptaItemFizikal(namaItem, jenisItem, laluanFullItem) {
    try {
      if (jenisItem === 'fail') {
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna, kodHtml: ``, pathFailBaru: laluanFullItem }),
        });
      } else {
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna, kodHtml: "FOLDER_PLACEHOLDER", pathFailBaru: `${laluanFullItem}/.keep` }),
        });
      }
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) {
      console.error("Gagal mencipta item fizikal awan:", e);
    }
  }

  // ❌ 4. Pemadaman Melata Objek (Cascading Folder/File Delete) dari Bucket
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
    } catch (e) {
      alert("Ralat memadam objek dari Cloudflare R2.");
    }
  }

  async function ambilPermintaanJiran(usernameAkaun) {
    try {
      const { data, error } = await supabase
        .from('ikatan_jiran')
        .select('id, status, pengirim_id, warga_profil(username)')
        .eq('penerima_username', usernameAkaun.toLowerCase())
        .eq('status', 'pending');

      if (!error && data) setPermintaanJiran(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function ambilJiranIntim(userId) {
    try {
      const { data, error } = await supabase
        .from('jiran_intim')
        .select('*')
        .eq('user_id', userId)
        .order('slot_kedudukan', { ascending: true });

      if (!error && data) setSenaraiJiranIntim(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUrusJiran(idRekod, statusBaru) {
    try {
      const { error } = await supabase
        .from('ikatan_jiran')
        .update({ status: statusBaru })
        .eq('id', idRekod);

      if (!error) {
        setPermintaanJiran(prev => prev.filter(item => item.id !== idRekod));
        if (statusBaru === 'accepted') {
          alert("🤝 Ikatan Rakan Tetangga siber berjaya termaktub!");
        } else {
          alert("📭 Permohonan jiran ditolak dengan harmoni.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleKunciJiranIntim(nomborSlot) {
    const targetUsername = inputSlot[nomborSlot]?.toLowerCase().trim();
    if (!targetUsername) {
      alert("⚠️ Sila isi nama teratak jiran terlebih dahulu bang!");
      return;
    }

    const { data: jiranWujud } = await supabase
      .from('warga_profil')
      .select('id')
      .eq('username', targetUsername)
      .maybeSingle();

    if (!jiranWujud) {
      alert(`❌ Alamak bang! Teratak @${targetUsername} tiada dalam direktori.`);
      return;
    }

    const { error } = await supabase
      .from('jiran_intim')
      .insert({ user_id: user.id, jiran_username: targetUsername, slot_kedudukan: nomborSlot });

    if (!error) {
      alert(`🎉 @${targetUsername} berjaya dikunci pada Slot ${nomborSlot}.`);
      setInputSlot(prev => ({ ...prev, [nomborSlot]: "" }));
      await ambilJiranIntim(user.id);
    } else {
      alert(error.code === '23505' ? "❌ Slot sudah diisi atau jiran sudah didaftarkan." : `❌ Ralat: ${error.message}`);
    }
  }

  async function handlePadamJiranIntim(idRekod) {
    if (!window.confirm("⚠️ Kosongkan slot jiran intim ini?")) return;
    const { error } = await supabase.from('jiran_intim').delete().eq('id', idRekod);
    if (!error) await ambilJiranIntim(user.id);
  }

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
        const res = await fetch(`/api/upload?username=${data.username}&path=index.html`);
        const dataKod = await res.json();
        if (dataKod.success && dataKod.kodHtml) setKodHtml(dataKod.kodHtml);
      } catch (err) {
        console.error(err);
      }
    } else {
      setHasProfil(false);
    }
  }

  async function ambilWargaR2() {
    try {
      const respon = await fetch("/api/warga");
      const hasil = await respon.json();
      if (hasil.success) setWargaLive(hasil.warga.slice(0, 5)); 
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function ambilDataSupabase() {
      const { data } = await supabase.from('projek_data').select('*');
      if (data && data[0]) setMesejDinamik(data[0].mesej);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await semakProfilWarga(currentUser);
      } else {
        setHasProfil(false);
        setNamaPengguna("");
        setPermintaanJiran([]);
        setSenaraiJiranIntim([]);
        setKodHtml("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
      }
    });

    ambilDataSupabase();
    ambilWargaR2();
    return () => subscription.unsubscribe();
  }, []);

  async function handleCiptaProfil(e) {
    e.preventDefault();
    if (!usernameInput || usernameInput.length < 3) {
      setErrorProfil("Nama teratak mestilah sekurang-kurangnya 3 aksara abangku! ⚠️");
      return;
    }
    setLoadingProfil(true);
    setErrorProfil("");

    try {
      const { error } = await supabase.from('warga_profil').insert({ id: user.id, username: usernameInput });
      if (error) {
        setErrorProfil(error.code === '23505' ? "Nama teratak ini sudah diambil warga lain! 😢" : error.message);
      } else {
        setNamaPengguna(usernameInput);
        setHasProfil(true);
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna: usernameInput, kodHtml, pathFailBaru: "index.html" }),
        });
        await ambilWargaR2(); 
        await muatSenaraiFailDaripadaR2(usernameInput);
      }
    } catch (err) {
      setErrorProfil("Ralat Sistem: Gagal menuntut nama teratak.");
    } finally {
      setLoadingProfil(false);
    }
  }

  async function handleSimpanKeR2(e) {
    e.preventDefault();
    setLoading(true);
    setStatusR2(`Mengemaskini fail [${failAktif.path}] ke Cloudflare R2... 🚀`);
    setLamanBerjaya("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPengguna, kodHtml, pathFailBaru: failAktif.path }),
      });
      const keputusan = await res.json();
      if (keputusan.success) {
        setStatusR2(`🎉 Berjaya! Fail [${failAktif.name}] selamat dikunci.`);
        setLamanBerjaya(namaPengguna.toLowerCase());
        await muatSenaraiFailDaripadaR2(namaPengguna); 
      } else {
        setStatusR2(`❌ Gagal: ${keputusan.message}`);
      }
    } catch (error) {
      setStatusR2(`❌ Ralat Sistem: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
        <ButangGoogleLogin user={user} handleLogin={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} handleLogout={() => supabase.auth.signOut()} />
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        
        {/* KEADAAN 1: BELUM LOG MASUK (LANDING PAGE RETRO VIBES) */}
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
                <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="bg-slate-950 border-2 border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 font-black px-6 py-3 tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(236,72,153,0.3)]">
                  🔑 MASUK & PACAK TERATAK SEKARANG
                </button>
              </div>
            </div>

            {/* DIREKTORI RINGKAS */}
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

        {/* KEADAAN 2: DAH LOG MASUK TAPI BELUM TUNTUT ALAMAT/USERNAME */}
        {user && !hasProfil && (
          <TuntutNamaTeratak 
            usernameInput={usernameInput} setUsernameInput={setUsernameInput}
            handleCiptaProfil={handleCiptaProfil} loadingProfil={loadingProfil} errorProfil={errorProfil}
          />
        )}

        {/* KEADAAN 3: KAWASAN STUDIO KREATIF DESKTOP (DAH ADA AKAUN & PROFIL) */}
        {user && hasProfil && (
          <div className="space-y-6 animate-fadeIn">
            
            <MenuNavigasiSiber />

            {/* STRUKTUR GRID WORKSPACE UTAMA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* PANEL KIRI: PENGURUS FAIL LALUAN FIZIKAL R2 */}
              <div className="lg:col-span-1">
                <PengurusFailGrid 
                  senaraiFail={senaraiFailR2}
                  loadingFail={loadingFailR2}
                  onFileSelect={handlePilihFailDariGrid}
                  onCiptaItem={handleCiptaItemFizikal}
                  onPadamItem={handlePadamItemFizikal}
                  namaPengguna={namaPengguna}
                />
              </div>

              {/* PANEL KANAN: BUNDLE NOTEPAD EDITOR STUDIO KREATIF */}
              <div className="lg:col-span-2">
                <BorangStudioKreatif 
                  namaPengguna={namaPengguna} kodHtml={kodHtml} setKodHtml={setKodHtml}
                  handleSimpanKeR2={handleSimpanKeR2} loading={loading} statusR2={statusR2}
                  lamanBerjaya={lamanBerjaya} failAktif={failAktif}
                />
              </div>

            </div>

            {/* ========================================================= */}
            {/* 📬 PANEL SOSIAL: PETI SURAT & CARTA JIRAN INTIM TOP 8     */}
            {/* ========================================================= */}
            <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-900">
              
              {/* A. PENERIMAAN PERMINTAAN JIRAN */}
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

              {/* B. PENGURUSAN SLOT CARTA JIRAN INTIM (TOP 8) */}
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
                            <input 
                              type="text" 
                              placeholder="nama jiran" 
                              value={inputSlot[slotNum] || ""} 
                              onChange={(e) => setInputSlot(prev => ({ ...prev, [slotNum]: e.target.value.replace(/[^a-zA-Z0-9]/g, "") }))}
                              className="bg-slate-900 border border-slate-850 px-1 py-0.5 text-[10px] text-white focus:outline-none focus:border-pink-500"
                            />
                            <button onClick={() => handleKunciJiranIntim(slotNum)} className="w-full bg-slate-900 border border-slate-750 text-slate-400 py-1 text-[9px] uppercase hover:border-pink-500 hover:text-pink-400 font-bold">Kunci</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}