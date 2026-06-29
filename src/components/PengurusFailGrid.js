"use client";

import { useState } from 'react';

export default function PengurusFailGrid({ onFileSelect, namaPengguna }) {
  // --- STATE STRUKTUR FAIL MAYA (ROOT LEVEL SECARA LALAI) ---
  const [senaraiFail, setSenaraiFail] = useState([
    { nama: "index.html", jenis: "fail", laluanFull: "index.html", kandungan: "<h1>Selamat Datang Ke Teratak Saya!</h1>" },
    { nama: "style.css", jenis: "fail", laluanFull: "style.css", kandungan: "body { background-color: #020617; }" },
    { nama: "gaya_retro", jenis: "folder", laluanFull: "gaya_retro", kandungan: "" },
    { nama: "animasi.gif", jenis: "fail", laluanFull: "gaya_retro/animasi.gif", kandungan: "MOCK_BINARY_GIF_DATA" }
  ]);

  // --- STATE NAVIGASI & INPUT ---
  const [folderSemasa, setFolderSemasa] = useState(""); // "" bermaksud Root / Teraju Utama
  const [inputNamaBaru, setInputLengkap] = useState("");
  const [modCipta, setModCipta] = useState(null); // 'fail' atau 'folder' atau null

  // --- 🛡️ BENTENG PUTIH: HAD EKSTENSI RISIKO RENDAH NYATAKAN ABANGKU ---
  const EKSTENSI_DIBENARKAN = [
    'html', 'htm', 'css', 'js', 'json', 'md', 'markdown', 'txt', 'text', 'gif', 'woff', 'woff2', 'ttf', 'svg'
  ];

  // Fungsi menyemak nama fail baharu
  function sahkanKeselamatanFail(nama) {
    const pecahan = nama.split('.');
    if (pecahan.length < 2) return false; // Tiada ekstensi
    const ekstensi = pecahan.pop().toLowerCase();
    return EKSTENSI_DIBENARKAN.includes(ekstensi);
  }

  // Handle Logik Cipta Entiti Baru (Fail/Folder)
  function handleCiptaEntiti(e) {
    e.preventDefault();
    const namaBersih = inputNamaBaru.trim().replace(/[^a-zA-Z0-9._-]/g, "");

    if (!namaBersih) {
      alert("⚠️ Nama tidak boleh dikosongkan abangku!");
      return;
    }

    const laluanFull = folderSemasa ? `${folderSemasa}/${namaBersih}` : namaBersih;

    // Semak jika nama bertindih
    if (senaraiFail.some(f => f.laluanFull.toLowerCase() === laluanFull.toLowerCase())) {
      alert("❌ Alamak bang! Fail atau folder dengan nama ini sudah wujud.");
      return;
    }

    if (modCipta === 'fail') {
      if (!sahkanKeselamatanFail(namaBersih)) {
        alert(`❌ Akses Ditolak! Kampung Siber hanya menyokong fail laman web statik yang selamat sahaja.\n\nEkstensi dibenarkan: ${EKSTENSI_DIBENARKAN.join(', ')}`);
        return;
      }
      
      // Masukkan fail baharu ke state
      setSenaraiFail(prev => [...prev, {
        nama: namaBersih,
        jenis: "fail",
        laluanFull: laluanFull,
        kandungan: `<!-- Fail ${namaBersih} Baru -->`
      }]);
    } else if (modCipta === 'folder') {
      if (namaBersih.includes('.')) {
        alert("⚠️ Folder tak boleh ada ekstensi titik (.) abangku!");
        return;
      }
      setSenaraiFail(prev => [...prev, {
        nama: namaBersih,
        jenis: "folder",
        laluanFull: laluanFull,
        kandungan: ""
      }]);
    }

    setInputLengkap("");
    setModCipta(null);
  }

  // Padam Fail/Folder
  function handlePadamEntiti(laluanTarget) {
    const sahkan = window.confirm(`⚠️ Pastikan abang? Tindakan ini akan memadamkan rekod: ${laluanTarget}`);
    if (!sahkan) return;

    setSenaraiFail(prev => prev.filter(f => !f.laluanFull.startsWith(laluanTarget)));
  }

  // Patah Balik ke Folder Atas (Back Navigation)
  function handlePatahBalik() {
    const pecahan = folderSemasa.split('/');
    pecahan.pop();
    setFolderSemasa(pecahan.join('/'));
  }

  // Tapis Item yang sepadan dengan direktori folder semasa sahaja
  const itemDipapar = senaraiFail.filter(item => {
    if (!folderSemasa) {
      // Papar item di Root level (Tiada tanda slash /)
      return !item.laluanFull.includes('/');
    } else {
      // Papar item di dalam sub-folder aktif
      const pecahanLaluan = item.laluanFull.split('/');
      const namaFolderInduk = pecahanLaluan.slice(0, -1).join('/');
      return namaFolderInduk === folderSemasa && item.laluanFull !== folderSemasa;
    }
  });

  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#eab308] font-mono text-xs text-white">
      {/* TOOLBAR ATAS (STYLE WINDOWS EXPLORER 95) */}
      <div className="bg-slate-800 p-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 border border-slate-850 text-yellow-400 font-bold max-w-xs truncate">
          📂 C:\teratak\{namaPengguna || "warga"}{folderSemasa ? `\\${folderSemasa.replace(/\//g, '\\')}` : ""}
        </div>
        
        <div className="flex gap-2">
          {folderSemasa && (
            <button 
              onClick={handlePatahBalik}
              className="bg-slate-950 border border-slate-700 hover:border-pink-500 text-pink-400 px-2.5 py-1 font-bold text-[11px] uppercase transition-colors"
            >
              ⬅️ Atas
            </button>
          )}
          <button 
            onClick={() => setModCipta(modCipta === 'fail' ? null : 'fail')}
            className="bg-slate-950 border border-emerald-500 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 px-3 py-1 font-bold text-[11px] uppercase transition-all"
          >
            📄 + Fail
          </button>
          <button 
            onClick={() => setModCipta(modCipta === 'folder' ? null : 'folder')}
            className="bg-slate-950 border border-blue-500 hover:bg-blue-600 hover:text-slate-950 text-blue-400 px-3 py-1 font-bold text-[11px] uppercase transition-all"
          >
            📁 + Folder
          </button>
        </div>
      </div>

      {/* POPUP INPUT CIPTA FAIL/FOLDER BALIK */}
      {modCipta && (
        <form onSubmit={handleCiptaEntiti} className="p-3 bg-slate-950 border-b border-slate-850 flex items-center gap-2 animate-fadeIn">
          <span className="text-yellow-500 font-bold">Nama {modCipta === 'fail' ? 'Fail' : 'Folder'}:</span>
          <input 
            type="text"
            autoFocus
            required
            placeholder={modCipta === 'fail' ? "cth: tentang.html, gaya.css" : "cth: imej, blog"}
            value={inputNamaBaru}
            onChange={(e) => setInputLengkap(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-yellow-500"
          />
          <button type="submit" className="bg-slate-850 border border-slate-700 hover:border-yellow-500 px-3 py-1 text-[11px] font-bold uppercase">Cipta</button>
          <button type="button" onClick={() => setModCipta(null)} className="text-red-400 hover:text-white px-1">❌</button>
        </form>
      )}

      {/* WINDOWS GRID VIEW PANEL AREA */}
      <div className="p-4 md:p-6 bg-slate-950 min-h-[220px] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {itemDipapar.length === 0 && (
          <div className="col-span-full text-center text-slate-600 font-mono text-[11px] py-12 select-none">
            [ Folder ini kosong bersih. Sila ketuk "+ Fail" untuk menambah lembaran kod. ]
          </div>
        )}

        {itemDipapar.map((item, indeks) => {
          const adakahFolder = item.jenis === "folder";
          return (
            <div 
              key={indeks}
              className="bg-slate-900 border-2 border-slate-850 hover:border-yellow-500 p-3 flex flex-col items-center justify-between text-center relative group transition-all select-none"
            >
              {/* Butang Padam Merah kecil waktu hover */}
              <button 
                onClick={() => handlePadamEntiti(item.laluanFull)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-950 border border-red-700 text-red-400 hover:bg-red-600 hover:text-white text-[9px] px-1 rounded transition-opacity"
              >
                DEL
              </button>

              {/* Rekaan Ikon Visual */}
              <div 
                onClick={() => adakahFolder ? setFolderSemasa(item.laluanFull) : onFileSelect(item)}
                className="w-full flex flex-col items-center cursor-pointer py-1"
              >
                <span className="text-3xl mb-2 filter drop-shadow">
                  {adakahFolder ? "📁" : item.nama.endsWith('.gif') ? "🖼️" : "📄"}
                </span>
                <span className="text-[11.5px] font-bold text-slate-200 group-hover:text-yellow-400 truncate w-full px-1">
                  {item.nama}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}