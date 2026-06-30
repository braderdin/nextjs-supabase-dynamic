"use client";

import { useState } from 'react';

export default function PengurusFailGrid({ 
  senaraiFail = [], 
  loadingFail = false, 
  onFileSelect, 
  onCiptaItem, 
  onPadamItem, 
  namaPengguna 
}) {
  // ➔ 🎚️ KAWALAN BARU: State suis penukar mod paparan (Grid / List)
  const [modPaparan, setModPaparan] = useState("grid");
  
  const [folderSemasa, setFolderSemasa] = useState(""); 
  const [inputNamaBaru, setInputNamaBaru] = useState("");
  const [isiFailBaru, setIsiFailBaru] = useState(""); 
  const [modCipta, setModCipta] = useState(null); 

  const EKSTENSI_DIBENARKAN = [
    'html', 'htm', 'css', 'js', 'json', 'md', 'markdown', 'txt', 'text', 'gif', 'woff', 'woff2', 'ttf', 'svg'
  ];

  function sahkanKeselamatanFail(nama) {
    const pecahan = nama.split('.');
    if (pecahan.length < 2) return false; 
    const ekstensi = pecahan.pop().toLowerCase();
    return EKSTENSI_DIBENARKAN.includes(ekstensi);
  }

  function handleCiptaEntiti(e) {
    e.preventDefault();
    const namaBersih = inputNamaBaru.trim().replace(/[^a-zA-Z0-9._-]/g, "");

    if (!namaBersih) {
      alert("⚠️ Nama tidak boleh dikosongkan abangku!");
      return;
    }

    const laluanFull = folderSemasa ? `${folderSemasa}/${namaBersih}` : namaBersih;

    if (senaraiFail.some(f => f.laluanFull.toLowerCase() === laluanFull.toLowerCase())) {
      alert("❌ Alamak bang! Fail atau folder dengan nama ini sudah wujud.");
      return;
    }

    if (modCipta === 'fail') {
      if (!sahkanKeselamatanFail(namaBersih)) {
        alert(`❌ Akses Ditolak! Sila gunakan ekstensi statik web yang sah sahaja.\n\nEkstensi dibenarkan: ${EKSTENSI_DIBENARKAN.join(', ')}`);
        return;
      }
      if (onCiptaItem) onCiptaItem(namaBersih, 'fail', laluanFull, isiFailBaru);
    } else if (modCipta === 'folder') {
      if (namaBersih.includes('.')) {
        alert("⚠️ Folder tidak boleh mengandungi simbol titik (.) abangku!");
        return;
      }
      if (onCiptaItem) onCiptaItem(namaBersih, 'folder', laluanFull, "");
    }

    setInputNamaBaru("");
    setIsiFailBaru(""); 
    setModCipta(null);
  }

  function handlePadamEntiti(laluanTarget) {
    const sahkan = window.confirm(`⚠️ Anda pasti? Tindakan ini akan memadamkan secara kekal dari Cloudflare R2: ${laluanTarget}`);
    if (!sahkan) return;
    if (onPadamItem) onPadamItem(laluanTarget);
  }

  function handlePatahBalik() {
    const pecahan = folderSemasa.split('/');
    pecahan.pop();
    setFolderSemasa(pecahan.join('/'));
  }

  const itemDipapar = senaraiFail.filter(item => {
    if (!folderSemasa) {
      return !item.laluanFull.includes('/');
    } else {
      const pecahanLaluan = item.laluanFull.split('/');
      const namaFolderInduk = pecahanLaluan.slice(0, -1).join('/');
      return namaFolderInduk === folderSemasa && item.laluanFull !== folderSemasa;
    }
  });

  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#eab308] font-mono text-xs text-white">
      
      {/* HEADER UTAMA PENGURUS FAIL */}
      <div className="bg-slate-800 p-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 border border-slate-850 text-yellow-400 font-bold max-w-xs truncate">
          📂 C:\teratak\{namaPengguna || "warga"}{folderSemasa ? `\\${folderSemasa.replace(/\//g, '\\')}` : ""}
        </div>
        
        <div className="flex gap-2">
          {folderSemasa && (
            <button 
              type="button"
              onClick={handlePatahBalik}
              className="bg-slate-950 border border-slate-700 hover:border-pink-500 text-pink-400 px-2.5 py-1 font-bold text-[11px] uppercase transition-colors"
            >
              ⬅️ Atas
            </button>
          )}
          <button 
            type="button"
            onClick={() => setModCipta(modCipta === 'fail' ? null : 'fail')}
            className="bg-slate-950 border border-emerald-500 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 px-3 py-1 font-bold text-[11px] uppercase transition-all"
          >
            📄 + Fail
          </button>
          <button 
            type="button"
            onClick={() => setModCipta(modCipta === 'folder' ? null : 'folder')}
            className="bg-slate-950 border border-blue-500 hover:bg-blue-600 hover:text-slate-950 text-blue-400 px-3 py-1 font-bold text-[11px] uppercase transition-all"
          >
            📁 + Folder
          </button>
        </div>
      </div>

      {/* ➔ 🎚️ TOOLBAR BARU: SUIS UTAMA MOD PAPARAN (PURE RETRO STYLE) */}
      <div className="bg-slate-950/60 border-b border-slate-850 p-1.5 px-3 flex items-center justify-end gap-2 text-[10px] select-none text-slate-500">
        <span className="font-bold tracking-wider">SUSUNAN_PAPARAN:</span>
        <button
          type="button"
          onClick={() => setModPaparan('grid')}
          className={`px-2 py-0.5 border text-[9px] font-black tracking-tight uppercase transition-colors ${
            modPaparan === 'grid' 
              ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
          }`}
        >
          🎚️ GRID.SYS
        </button>
        <button
          type="button"
          onClick={() => setModPaparan('list')}
          className={`px-2 py-0.5 border text-[9px] font-black tracking-tight uppercase transition-colors ${
            modPaparan === 'list' 
              ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
          }`}
        >
          📝 SENARAI.TXT
        </button>
      </div>

      {/* BORANG DINAMIK: INPUT NAMA & KOTAK TEXT CIPTA FAIL */}
      {modCipta && (
        <form onSubmit={handleCiptaEntiti} className="p-4 bg-slate-950 border-b border-slate-850 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 font-bold whitespace-nowrap">Nama {modCipta === 'fail' ? 'Fail' : 'Folder'}:</span>
            <input 
              type="text"
              autoFocus
              required
              placeholder={modCipta === 'fail' ? "cth: portfolio.html, tema.css" : "cth: imej, arkib"}
              value={inputNamaBaru}
              onChange={(e) => setInputNamaBaru(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {modCipta === 'fail' && (
            <div className="space-y-1">
              <span className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">Isi Kandungan Fail / Kod Awal (Opsional):</span>
              <textarea 
                rows={5}
                placeholder=""
                value={isiFailBaru}
                onChange={(e) => setIsiFailBaru(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 font-mono text-xs text-yellow-300 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModCipta(null)} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 px-3 py-1 text-[11px] uppercase">Batal</button>
            <button type="submit" className="bg-slate-900 border border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-500 px-4 py-1 text-[11px] font-bold uppercase transition-all">Pacak Item</button>
          </div>
        </form>
      )}

      {/* KONTENA DENGAN STRUKTUR KELAS DINAMIK (GRID ATAU LAYOUT SENARAI) */}
      <div className={`p-4 md:p-6 bg-slate-950 min-h-[220px] max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 ${
        modPaparan === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' 
          : 'flex flex-col gap-2'
      }`}>
        
        {loadingFail && (
          <div className="col-span-full text-center text-slate-500 font-mono py-12 animate-pulse">
            🔄 Sedang memancarkan isyarat satelit R2...
          </div>
        )}

        {!loadingFail && itemDipapar.length === 0 && (
          <div className="col-span-full text-center text-slate-600 font-mono text-[11px] py-12 select-none">
            [ Direktori kosong. Sila klik "+ Fail" untuk bermula abangku! ]
          </div>
        )}

        {!loadingFail && itemDipapar.map((item, indeks) => {
          const adakahFolder = item.jenis === "folder";
          const lambangIkon = adakahFolder ? "📁" : item.nama.endsWith('.gif') ? "🖼️" : "📄";

          // ➔ 📝 LAYOUT ALTERNATIF: Render gaya Senarai Berbaris Panjang (List View)
          if (modPaparan === 'list') {
            return (
              <div 
                key={indeks}
                className="w-full flex items-center justify-between bg-slate-900 border border-slate-850/60 hover:border-yellow-500 p-2.5 px-4 group transition-all select-none shadow-sm"
              >
                <div 
                  onClick={() => adakahFolder ? setFolderSemasa(item.laluanFull) : onFileSelect(item)}
                  className="flex-1 flex items-center gap-3 cursor-pointer truncate"
                >
                  <span className="text-xl filter drop-shadow-sm flex-shrink-0">{lambangIkon}</span>
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-yellow-400 truncate">
                    {item.nama}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950 px-1.5 py-0.5 border border-slate-850 hidden sm:inline-block">
                    {item.jenis}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handlePadamEntiti(item.laluanFull)}
                    className="bg-red-950/50 border border-red-900/40 text-red-400 hover:bg-red-600 hover:text-white text-[9px] px-2 py-0.5 font-bold uppercase transition-colors"
                  >
                    DEL
                  </button>
                </div>
              </div>
            );
          }

          // ➔ 🎚️ LAYOUT ASAL: Render gaya Grid Ikon Berkotak (Grid View)
          return (
            <div 
              key={indeks}
              className="bg-slate-900 border-2 border-slate-850 hover:border-yellow-500 p-3 flex flex-col items-center justify-between text-center relative group transition-all select-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]"
            >
              <button 
                type="button"
                onClick={() => handlePadamEntiti(item.laluanFull)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-950 border border-red-700 text-red-400 hover:bg-red-600 hover:text-white text-[9px] px-1 rounded transition-opacity"
              >
                DEL
              </button>

              <div 
                onClick={() => adakahFolder ? setFolderSemasa(item.laluanFull) : onFileSelect(item)}
                className="w-full flex flex-col items-center cursor-pointer py-1"
              >
                <span className="text-3xl mb-2 filter drop-shadow">
                  {lambangIkon}
                </span>
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-yellow-400 truncate w-full px-1">
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