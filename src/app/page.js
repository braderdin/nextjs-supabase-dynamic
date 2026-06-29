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

  // ➔ SUNTIKAN STATE NYATA: Memegang status fail fizikal dari Cloudflare R2
  const [senaraiFailR2, setSenaraiFailR2] = useState([]);
  const [loadingFailR2, setLoadingFailR2] = useState(false);

  const [permintaanJiran, setPermintaanJiran] = useState([]);
  const [senaraiJiranIntim, setSenaraiJiranIntim] = useState([]);
  const [inputSlot, setInputSlot] = useState({}); 

  // Penarik fail live dari R2
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

  // Menukar fokus suntingan Notepad ke fail fizikal yang dipilih dari grid
  async function handlePilihFailDariGrid(fail) {
    if (fail.jenis === 'folder') return;
    setFailAktif({ name: fail.nama, path: fail.laluanFull });
    setLoading(true);
    setStatusR2(`Membuka dekripsi data fail [${fail.laluanFull}]... 📥`);
    
    try {
      const res = await fetch(`/api/upload?username=${namaPengguna}&path=${fail.laluanFull}`);
      const data = await res.json();
      if (data.success) {
        setKodHtml(data.kodHtml);
        setStatusR2(`Fail [${fail.nama}] sedia disunting.`);
      } else {
        setKodHtml(``);
      }
    } catch (err) {
      setKodHtml(``);
    } finally {
      setLoading(false);
    }
  }

  // Mengendalikan penciptaan item fizikal (Fail baru diisi placeholder, folder baru diisi .keep)
  async function handleCiptaItemFizikal(namaItem, jenisItem, laluanFullItem) {
    try {
      if (jenisItem === 'fail') {
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna, kodHtml: ``, pathFailBaru: laluanFullItem }),
        });
      } else {
        // R2 memerlukan fail fizikal untuk mengekalkan laluan folder kosong (.keep hack)
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna, kodHtml: "FOLDER_PLACEHOLDER", pathFailBaru: `${laluanFullItem}/.keep` }),
        });
      }
      await muatSenaraiFailDaripadaR2(namaPengguna);
    } catch (e) {
      console.error(e);
    }
  }

  // Mengendalikan pemadaman item dari storan R2 awan
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
        // Jika fail aktif dipadam, alih balik fokus ke index.html
        if (failAktif.path.startsWith(laluanFullItem)) {
          setFailAktif({ name: "index.html", path: "index.html" });
          const resIndex = await fetch(`/api/upload?username=${namaPengguna}&path=index.html`);
          const dataIndex = await resIndex.json();
          if (dataIndex.success) setKodHtml(dataIndex.kodHtml);
        }
      }
    } catch (e) {
      alert("Ralat memadam objek.");
    }
  }

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
  }

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
      await muatSenaraiFailDaripadaR2(data.username); // ➔ AMBIL INDEKS FAIL REALTIME R2
      
      try {
        const amarahRespon = await fetch(`/api/upload?username=${data.username}&path=index.html`);
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
        
        // Cipta fail index.html fizikal pertama secara automatik di R2 untuk warga baru
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaPengguna: usernameInput, kodHtml, pathFailBaru: "index.html" }),
        });

        await ambilWargaR2(); 
        await muatSenaraiFailDaripadaR2(usernameInput);
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
        await muatSenaraiFailDaripadaR2(namaPengguna); // Segarkan senarai grid
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
          <div className="space-y-8