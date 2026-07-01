"use client";

import { useState } from 'react';
// Mula: PEMBAIKAN JITU - Import useRouter untuk menguruskan lonjakan pautan URL baru 2026
import { useRouter } from 'next/navigation';
// Tamat: PEMBAIKAN JITU - Import useRouter untuk menguruskan lonjakan pautan URL baru 2026

export default function PengurusFailGrid({ 
  senaraiFail = [], 
  loadingFail = false, 
  onFileSelect, 
  onCiptaItem, 
  onPadamItem, 
  namaPengguna,
  onCommitProject,
  loadingCommit = false,
  onShowWhitelist
}) {
  const [modPaparan, setModPaparan] = useState("grid");
  const [folderSemasa, setFolderSemasa] = useState(""); 
  const [inputNamaBaru, setInputNamaBaru] = useState("");
  const [isiFailBaru, setIsiFailBaru] = useState(""); 
  const [modCipta, setModCipta] = useState(null); 
  
  // Mula: PEMBAIKAN JITU - Inisialisasi fungsi router Next.js
  const router = useRouter();
  // Tamat: PEMBAIKAN JITU - Inisialisasi fungsi router Next.js

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
      alert(" Alamak bang! Fail atau folder dengan nama ini sudah wujud.");
      return;
    }
    if (modCipta === 'fail') {
      if (!sahkanKeselamatanFail(namaBersih)) {
        alert(` Access Denied! Sila gunakan ekstensi statik web yang sah sahaja.\n\nEkstensi dibenarkan: ${EKSTENSI_DIBENARKAN.join(', ')}`);
        return;
      }
      if (onCiptaItem) onCiptaItem(namaBersih, 'fail', laluanFull, isiFailBaru);
    } else if (modCipta === 'folder') {
      if (namaBersih.includes('.')) {
        alert(" Folder tidak boleh mengandungi simbol titik (.) abangku!");
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
    <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] font-mono text-xs text-white flex flex-col justify-between transition-all rounded-none">
      <div>
        {/* Header Toolbar Minimalis */}
        <div className="bg-slate-900/40 p-3 border-b border-slate-900/80 flex flex-wrap items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-2">
            <div className="bg-slate-950/60 border border-slate-900/60 px-2.5 py-1 text-slate-400 text-[11px] max-w-[180px] sm:max-w-xs truncate rounded-none font-bold">
              root_dir:\teratak\{namaPengguna || "warga"}{folderSemasa ? `\\${folderSemasa.replace(/\//g, '\\')}` : ""}
            </div>
            <button
              type="button"
              onClick={onShowWhitelist}
              className="bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-700 px-2 py-1 font-bold text-[10px] uppercase transition-all tracking-tight rounded-none"
            >
              jenis_fail.txt
            </button>
          </div>
          
          <div className="flex items-center gap-1.5">
            {folderSemasa && (
              <button 
                type="button"
                onClick={handlePatahBalik}
                className="bg-slate-900/50 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900 px-2.5 py-1 font-bold text-[11px] uppercase transition-colors rounded-none"
              >
                Atas
              </button>
            )}
            <button 
              type="button"
              onClick={() => setModCipta(modCipta === 'fail' ? null : 'fail')}
              className={`border px-3 py-1 font-bold text-[11px] uppercase transition-all rounded-none ${
                modCipta === 'fail' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
              }`}
            >
              + Fail
            </button>
            <button 
              type="button"
              onClick={() => setModCipta(modCipta === 'folder' ? null : 'folder')}
              className={`border px-3 py-1 font-bold text-[11px] uppercase transition-all rounded-none ${
                modCipta === 'folder' ? 'bg-blue-950/40 border-blue-800 text-blue-400' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
              }`}
            >
              + Folder
            </button>
          </div>
        </div>

        {/* Layout Tab Mode Paparan */}
        <div className="bg-slate-950/20 border-b border-slate-900/40 p-1.5 px-3 flex items-center justify-end gap-2 text-[10px] select-none text-slate-500">
          <span className="font-bold tracking-wider text-[9px] uppercase text-slate-600">Paparan:</span>
          <button type="button" onClick={() => setModPaparan('grid')} className={`px-2 py-0.5 border text-[9px] font-bold uppercase transition-colors rounded-none ${modPaparan === 'grid' ? 'bg-slate-900 border-slate-800 text-white font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>Grid</button>
          <button type="button" onClick={() => setModPaparan('list')} className={`px-2 py-0.5 border text-[9px] font-bold uppercase transition-colors rounded-none ${modPaparan === 'list' ? 'bg-slate-900 border-slate-800 text-white font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>Senarai</button>
        </div>

        {/* Borang Dinamik Cipta Item */}
        {modCipta && (
          <form onSubmit={handleCiptaEntiti} className="p-4 bg-slate-950/60 border-b border-slate-900/60 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold whitespace-nowrap text-[11px]">Nama {modCipta === 'fail' ? 'Fail' : 'Folder'}:</span>
              <input type="text" autoFocus required placeholder={modCipta === 'fail' ? "cth: portfolio.html, tema.css" : "cth: imej, arkib"} value={inputNamaBaru} onChange={(e) => setInputNamaBaru(e.target.value)} className="flex-1 bg-slate-900/40 border border-slate-900 px-2 py-1 text-xs text-white focus:outline-none focus:border-slate-800 font-mono rounded-none" />
            </div>
            {modCipta === 'fail' && (
              <div className="space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Kod Sumber Awal (Opsional):</span>
                <textarea rows={4} placeholder="<!-- Tulis kod HTML/CSS anda di sini -->" value={isiFailBaru} onChange={(e) => setIsiFailBaru(e.target.value)} className="w-full bg-slate-900/40 border border-slate-900 p-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-slate-800 resize-none rounded-none shadow-inner" />
              </div>
            )}
            <div className="flex justify-end gap-1.5 pt-1">
              <button type="button" onClick={() => setModCipta(null)} className="bg-transparent border border-transparent text-slate-500 hover:text-slate-300 px-3 py-1 text-[11px] uppercase transition-colors rounded-none">Batal</button>
              <button type="submit" className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white px-4 py-1 text-[11px] font-bold uppercase transition-all rounded-none">Pacak Item</button>
            </div>
          </form>
        )}

        {/* Grid & List Container Bento Asset */}
        <div className={`p-4 bg-transparent min-h-[240px] max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent ${modPaparan === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'flex flex-col gap-1.5'}`}>
          {loadingFail && <div className="col-span-full text-center text-slate-600 font-mono py-12 animate-pulse select-none">[ Membaca gelombang isyarat storan Cloudflare R2... ]</div>}
          {!loadingFail && itemDipapar.length === 0 && <div className="col-span-full text-center text-slate-600 font-mono text-[11px] py-12 select-none">[ Direktori kosong. Sila klik "+ Fail" untuk memulakan projek teratak abangku! ]</div>}

          {!loadingFail && itemDipapar.map((item, indeks) => {
            const adakahFolder = item.jenis === "folder";
            
            const lambangIkon = adakahFolder ? (
              <svg className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            ) : item.nama.endsWith('.gif') || item.nama.endsWith('.png') || item.nama.endsWith('.svg') ? (
              <svg className="w-6 h-6 text-slate-500 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ) : (
              <svg className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            );

            if (modPaparan === 'list') {
              return (
                <div key={indeks} className="w-full flex items-center justify-between bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-2 px-3 group transition-all select-none rounded-none">
                  <div onClick={() => adakahFolder ? setFolderSemasa(item.laluanFull) : router.push(`/site_files/text_editor?filename=${item.laluanFull}`)} className="flex-1 flex items-center gap-3 cursor-pointer truncate">
                    <span className="flex-shrink-0">{lambangIkon}</span>
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">{item.nama}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!adakahFolder && (
                      <button
                        type="button"
                        onClick={() => router.push(`/site_files/text_editor?filename=${item.laluanFull}`)} // Nombor 3: Lompatan URL Editor Khas
                        className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[9px] px-2 py-0.5 font-bold uppercase transition-all rounded-none"
                      >
                        Sunting
                      </button>
                    )}
                    <button type="button" onClick={() => handlePadamEntiti(item.laluanFull)} className="bg-slate-950/60 border border-slate-900 text-red-500/70 hover:text-red-400 text-[9px] px-2 py-0.5 font-bold uppercase transition-colors rounded-none">Padam</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={indeks} className="bg-slate-900/20 border border-slate-900/80 hover:border-slate-800 p-3.5 flex flex-col items-center justify-between text-center relative group transition-all select-none min-h-[105px] rounded-none shadow-sm">
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity z-10">
                  <button type="button" onClick={() => handlePadamEntiti(item.laluanFull)} className="bg-slate-950 border border-slate-900 text-red-500/60 hover:text-red-400 text-[8px] px-1.5 rounded-none font-bold py-0.5 uppercase transition-all">×</button>
                </div>
                <div onClick={() => adakahFolder ? setFolderSemasa(item.laluanFull) : router.push(`/site_files/text_editor?filename=${item.laluanFull}`)} className="w-full flex flex-col items-center cursor-pointer py-1 flex-1 justify-center">
                  <span className="mb-2 scale-110 block transition-transform duration-300 group-hover:scale-120">{lambangIkon}</span>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-white truncate w-full px-1">{item.nama}</span>
                </div>
                {!adakahFolder && (
                  <button
                    type="button"
                    onClick={() => router.push(`/site_files/text_editor?filename=${item.laluanFull}`)} // Nombor 3: Lompatan URL Editor Khas
                    className="w-full mt-2 bg-slate-950/60 border border-slate-900 text-slate-500 group-hover:border-slate-800 group-hover:text-slate-300 py-0.5 text-[9px] font-bold uppercase transition-all rounded-none"
                  >
                    [ Sunting ]
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}