"use client";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Import komponen modular rasmi Kampung Siber
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
  // --- STATE UTAMA ---
  const [user, setUser] = useState(null);
  const [hasProfil, setHasProfil] = useState(false); 
  const [wargaLive, setWargaLive] = useState([]);    
  const [mesejDinamik, setMesejDinamik] = useState("Menghubung satelit Supabase... 📡");
  
  // --- STATE TUNTUT PROFILE ---
  const [usernameInput, setUsernameInput] = useState("");
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [errorProfil, setErrorProfil] = useState("");

  // --- STATE FORM STUDIO KREATIF ---
  const [namaPengguna, setNamaPengguna] = useState("");
  const [kodHtml, setKodHtml] = useState("<h1>Selamat Datang Ke Teratak Saya!</h1>\n<p>Laman web ini dibina menggunakan HTML & CSS comel.</p>");
  const [loading, setLoading] = useState(false);
  const [statusR2, setStatusR2] = useState("");
  const [lamanBerjaya, setLamanBerjaya] = useState("");

  const [failAktif, setFailAktif] = useState({ name: "index.html", path: "index.html" });

  // --- STATE PETI SURAT & JIRAN ---
  const [permintaanJiran, setPermintaanJiran] = useState([]);
  const [senaraiJiranIntim, setSenaraiJiranIntim] = useState([]);
  const [inputSlot, setInputSlot] = useState({}); 

  function handlePilihFailDariGrid(fail) {
    setFailAktif({ name: fail.nama, path: fail.laluanFull });
    setKodHtml(fail.kandungan || "");
    console.log(`[SYSTEM]: Menukar fokus editor ke fail -> ${fail.laluanFull}`);
  } // ➔ PEMBAIKAN: Ditambah penutup yang tercicir

  async function ambilPermintaanJiran(usernameAkaun) {
    try {
      const { data, error } = await supabase
        .from('ikatan_jiran')
        .select('id, status, pengirim_id, warga_profil(username)')
        .eq('penerima_username', usernameAkaun.toLowerCase())
        .eq('status', 'pending');

      if (!error && data) {
        setPermintaanJiran(data);
      }
    } catch (err) {
      console.error("Gagal memeriksa Peti Surat Jiran.");
    }
  } // ➔ PEMBAIKAN: Ditambah penutup yang tercicir

  async function ambilJiranIntim(userId) {
    try {
      const { data, error } = await supabase
        .from('jiran_intim')
        .select('*')
        .eq('user_id', userId)
        .order('slot_kedudukan', { ascending: true });

      if (!error && data) {
        setSenaraiJiranIntim(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data jiran intim.");
    }
  } // ➔ PEMBAIKAN: Ditambah penutup yang tercicir

  async function handleUrusJiran(idRekod, statusBaru) {
    try {
      const { error } = await supabase
        .from('ikatan_jiran')
        .update({ status: statusBaru })
        .eq('id', idRekod);

      if (!error) {
        setPermintaanJiran(prev => prev.filter(item => item.id !== idRekod));
        if (statusBaru === 'accepted') {
          alert("🤝 Alhamdulillah bang! Ikatan Rakan Tetangga berjaya termaktub!");
        } else {
          alert("📭 Permohonan jiran telah ditolak dengan harmoni.");
        }
      } else {
        alert("❌ Ralat database: Gagal memproses permohonan.");
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
      .insert({
        user_id: user.id,
        jiran_username: targetUsername,
        slot_kedudukan: nomborSlot
      });

    if (!error) {
      alert(`🎉 Mantap! @${targetUsername} berjaya dikunci pada Slot ${nomborSlot}.`);
      setInputSlot(prev => ({ ...prev, [nomborSlot]: "" }));
      await ambilJiranIntim(user.id);
    } else {
      if (error.code === '23505') {
        alert("❌ Ralat: Slot ini sudah diisi atau jiran tersebut sudah tersenarai di slot lain.");
      } else {
        alert(`❌ Ralat Sistem: ${error.message}`);
      }
    }
  }

  async function handlePadamJiranIntim(idRekod) {
    const sahPadam = window.confirm("⚠️ Anda pasti ingin mengosongkan slot jiran intim ini?");
    if (!sahPadam) return;

    const { error } = await supabase
      .from('jiran_intim')
      .delete()
      .eq('id', idRekod);

    if (!error) {
      setSenaraiJiranIntim(prev => prev.filter(item => item.id !== idRekod));
    } else {
      alert("❌ Gagal mengosongkan slot.");
    }
  }

  async function semakProfilWarga(currentUser) {
    if (!currentUser) return;
    const { data } = await supabase
      .from('warga_profil')
      .select('username')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (data) {
      setNamaPengguna(data.username); 
      setHasProfil(true);
      
      await ambilPermintaanJiran(data.username);
      await ambilJiranIntim(currentUser.id);
      
      try {
        const amarahRespon = await fetch(`/api/upload?username=${data.username}`);
        const dataKod = await amarahRespon.json();
        if (dataKod.success && dataKod.kodHtml) {
          setKodHtml(dataKod.kodHtml);
        }
      } catch (err) {
        console.error("Gagal auto-load kod lama dari storan R2.");
      }
    } else {
      setHasProfil(false);
    }
  }

  async function ambilWargaR2() {
    try {
      const respon = await fetch("/api/warga");
      const hasil = await respon.json();
      if (hasil.success) {
        setWargaLive(hasil.warga.slice(0, 5)); 
      }
    } catch (err) {
      console.error("Gagal menarik senarai warga.");
    }
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
      const { error } = await supabase
        .from('warga_profil')
        .insert({ id: user.id, username: usernameInput });

      if (error) {
        if (error.code === '23505') {
          setErrorProfil("Alamak! Nama teratak ini sudah diambil oleh warga lain. Sila pilih nama lain! 😢");
        } else {
          setErrorProfil(error.message);
        }
      } else {
        setNamaPengguna(usernameInput);
        setHasProfil(true);
        await ambilWargaR2(); 
      }
    } catch (err) {
      setErrorProfil("Ralat Sistem: Gagal menuntut nama.");
    } finally {
      setLoadingProfil(false);
    }
  }

  async function handleLoginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleSimpanKeR2(e) {
    e.preventDefault();
    setLoading(true);
    setStatusR2(`Sedang mengemaskini fail [${failAktif.path}] ke Cloudflare R2... 🚀`);
    setLamanBerjaya("");

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
        await ambilWargaR2(); 
      } else {
        setStatusR2(`❌ Gagal: ${keputusan.error || keputusan.message}`);
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
        <ButangGoogleLogin user={user} handleLogin={handleLoginGoogle} handleLogout={handleLogout} />
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-8">
        
        {!user && (
          <div className="space-y-8 transition-all duration-300">
            <div className="text-center p-8 md:p-12 bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6] max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-blue-600 text-slate-950 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">📢 Hebahan Utama</div>
              <h2 className="text-2xl md:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300 tracking-tight leading-tight uppercase">
                Bina Laman Web Bebas Anda <br className="hidden md:inline"/> Dengan Jiwa Retro!
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-mono mt-4 max-w-xl mx-auto leading-relaxed">
                Ekspresikan kreativiti anda menggunakan kod HTML & CSS tulen tanpa sekatan algoritma. Kampung Siber ialah teratak siber Nusantara yang mesra, comel, dan bebas iklan selamanya.
              </p>
              <div className="mt-8">
                <button onClick={handleLoginGoogle} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-black py-4 px-8 text-xs md:text-sm tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_#eab308]">
                  🚀 BUKA TERATAK SIBER ANDA (PERCUMA!)
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#ec4899] max-w-2xl mx-auto">
              <div className="bg-slate-800 px-3 py-1.5 border-b border-slate-800 font-mono text-[10px] text-slate-400 select-none uppercase tracking-wider">
                ✨ Teratak Warga Siber Yang Baru Dikemas Kini secara Live:
              </div>
              <div className="p-4 font-mono text-xs divide-y divide-slate-800/50">
                {wargaLive.length === 0 ? (
                  <div className="text-center text-slate-600 py-6 text-[11px]">[ Pangkalan data bersih: Menunggu pendaftaran warga siber pertama... ]</div>
                ) : (
                  wargaLive.map((nama, indeks) => (
                    <div key={indeks} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="text-pink-400 font-bold hover:underline"><Link href={`/laman/${nama}`}>➔ /laman/{nama}</Link></span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight bg-slate-950 px-2 py-0.5 border border-slate-800/40">Warga Tulen 🟢</span>
                    </div>
                  ))
                )}
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
          <div className="space-y-6 transition-all duration-300">
            <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#3b82f6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black font-mono text-blue-400 uppercase tracking-tight">🗂️ BILIK KAWALAN SIBER INDIVIDU</h1>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Selamat kembali warga <span className="text-pink-400 font-bold">@{namaPengguna}</span>. Selamat menghias profil peribadi anda!
                </p>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 px-3 py-1.5 text-center sm:text-right rounded-none font-mono">
                <span className="text-[9px] text-orange-400 block font-bold uppercase">📡 Hub Supabase:</span>
                <span className="text-xs text-emerald-400 block truncate max-w-[200px]">"{mesejDinamik}"</span>
              </div>
            </div>

            <MenuNavigasiSiber />

            {permintaanJiran.length > 0 && (
              <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#ec4899] animate-fadeIn">
                <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-300 select-none">
                  <span>📬 peti_surat_jiran.exe ({permintaanJiran.length})</span>
                  <span className="text-[9px] text-pink-400 font-bold animate-pulse">PERMOHONAN BARU</span>
                </div>
                <div className="p-4 font-mono text-xs space-y-3">
                  <div className="space-y-2">
                    {permintaanJiran.map((jiran) => (
                      <div key={jiran.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-950 border border-slate-850 gap-2">
                        <div>
                          <span className="text-yellow-400 font-bold">@{jiran.warga_profil?.username || "warga_siber"}</span>
                          <span className="text-slate-500 text-[10px] block sm:inline sm:ml-2">Mengirim salam mohon berjiran tetangga.</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUrusJiran(jiran.id, 'accepted')}
                            className="bg-slate-900 hover:bg-emerald-600 border border-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[10px] uppercase px-3 py-1 transition-all"
                          >
                            🤝 Terima
                          </button>
                          <button 
                            onClick={() => handleUrusJiran(jiran.id, 'rejected')}
                            className="bg-slate-900 hover:bg-red-600 border border-red-500 text-red-400 hover:text-white font-bold text-[10px] uppercase px-3 py-1 transition-all"
                          >
                            ❌ Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308]">
              <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-300 select-none">
                <span>⚙️ pengurus_jiran_intim.exe (Top 8 Management)</span>
                <span className="text-[9px] text-yellow-400 font-bold">SUSUN GRID MYSPACE</span>
              </div>
              <div className="p-4 font-mono text-xs">
                <p className="text-[11px] text-slate-400 mb-4">
                  [SUNTIKAN CIRI]: Tetapkan nama teratak jiran kegemaran abang mengikut slot 1 hingga 8 untuk dipaparkan di halaman umum.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 8 }, (_, i) => {
                    const slotNum = i + 1;
                    const jiranDitemui = senaraiJiranIntim.find(j => Number(j.slot_kedudukan) === slotNum);

                    return (
                      <div key={slotNum} className="bg-slate-950 border border-slate-850 p-2 flex items-center justify-between gap-2">
                        <span className="text-slate-500 text-[11px] font-bold">Slot 0{slotNum}:</span>
                        {jiranDitemui ? (
                          <div className="flex-1 flex items-center justify-between pl-2 bg-slate-900 border border-slate-800/60 py-1">
                            <span className="text-pink-400 font-bold">@{jiranDitemui.jiran_username}</span>
                            <button
                              onClick={() => handlePadamJiranIntim(jiranDitemui.id)}
                              className="text-[9px] text-red-400 hover:text-white bg-slate-950 hover:bg-red-900 px-2 py-0.5 border border-slate-800 transition-colors uppercase font-bold"
                            >
                              Kosongkan
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex gap-1">
                            <input
                              type="text"
                              placeholder="Nama teratak..."
                              value={inputSlot[slotNum] || ""}
                              onChange={(e) => setInputSlot(prev => ({ ...prev, [slotNum]: e.target.value.replace(/[^a-zA-Z0-9]/g, "") }))}
                              className="flex-1 bg-slate-900 border border-slate-850 px-2 py-1 text-[11px] text-yellow-400 placeholder-slate-700 focus:outline-none"
                            />
                            <button
                              onClick={() => handleKunciJiranIntim(slotNum)}
                              className="bg-slate-900 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950 px-3 py-1 text-[9px] font-bold uppercase transition-all"
                            >
                              🔒 Kunci
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <PengurusFailGrid 
              namaPengguna={namaPengguna} 
              onFileSelect={handlePilihFailDariGrid} 
            />

            <BorangStudioKreatif 
              namaPengguna={namaPengguna}
              setNamaPengguna={setNamaPengguna}
              kodHtml={kodHtml}
              setKodHtml={setKodHtml}
              handleSimpanKeR2={handleSimpanKeR2}
              loading={loading}
              statusR2={statusR2}
              lamanBerjaya={lamanBerjaya}
              failAktif={failAktif} 
            />
          </div>
        )}

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12 select-none">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}