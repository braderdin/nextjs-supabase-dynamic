"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function BorangStudioKreatif({
  namaPengguna,
  setNamaPengguna,
  kodHtml,
  setKodHtml,
  handleSimpanKeR2,
  loading,
  statusR2,
  lamanBerjaya,
  failAktif 
}) {
  const [inputLagu, setInputLagu] = useState("");
  const [notifikasiLagu, setNotifikasiLagu] = useState("");

  // Mula: PEMBAIKAN JITU - Menyelaras setMoodParlan kepada setMoodPilihan yang tepat
  const [moodPilihan, setMoodPilihan] = useState("☕");
  const [moodTeksInput, setMoodTeksInput] = useState("Bertukang Kod");
  // Tamat: PEMBAIKAN JITU - Menyelaras setMoodParlan kepada setMoodPilihan yang tepat

  function handleMuatTemplateAsas(e) {
    e.preventDefault();
    const confirmMuat = window.confirm("⚠️ Amaran abangku! Memuatkan template akan memadamkan semua kod sedia ada dalam editor. Anda pasti?");
    
    if (confirmMuat) {
      const templateRetroAsli = `<div style="background-color: #020617; color: #ffffff; font-family: monospace; padding: 20px; border: 4px double #ec4899; max-width: 600px; margin: 0 auto;">
  <marquee style="background-color: #ec4899; color: #020617; font-weight: bold; padding: 5px; margin-bottom: 20px;">
    🌟 SELAMAT DATANG KE TERATAK SIBER SAYA! PERGHI MANTAP... 🌟
  </marquee>
  <div style="text-align: center; margin-bottom: 25px;">
    <img src="https://api.dicebear.com/7.x/pixel-art/svg" alt="Avatar" style="border: 3px solid #10b981; width: 100px; height: 100px; background-color: #0f172a; padding: 5px;" />
    <h1 style="color: #10b981; font-size: 20px; margin-top: 10px; text-transform: uppercase;">🌐 Teratak @${namaPengguna || 'warga'}</h1>
  </div>
</div>`;
      setKodHtml(templateRetroAsli);
    }
  }

  function handleSuntikMuzikLatar(e) {
    e.preventDefault();
    if (!inputLagu) {
      setNotifikasiLagu("⚠️ Sila isi pautan YouTube abangku!");
      return;
    }
    const corakIdYoutube = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const semakPautan = inputLagu.match(corakIdYoutube);

    if (semakPautan && semakPautan[1]) {
      const videoId = semakPautan[1];
      const kodIframeMuzik = `\n\n\n<iframe width="0" height="0" src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0" allow="autoplay" style="display:none; visibility:hidden;"></iframe>\n`;
      setKodHtml((kodLama) => kodLama + kodIframeMuzik);
      setInputLagu("");
      setNotifikasiLagu("🎉 Muzik latar belakang berjaya disuntik!");
      setTimeout(() => setNotifikasiLagu(""), 4000);
    } else {
      setNotifikasiLagu("❌ Alamak abangku! Alamat pautan YouTube tidak sah. Cuba lagi.");
    }
  }

  return (
    // Mula: Transformasi Master Kerangka Bento Workspace Studio 2026
    <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-0 font-mono text-xs text-slate-300 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] space-y-4 rounded-none transition-all">
      
      {/* Mula: Segmen 1 - Analutik Piksel Moden (Bento Grid View) */}
      <div className="p-5 bg-slate-900/20 border-b border-slate-900/60 select-none">
        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
          studio_analytics::weekly_pixel_traffic
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Hari Isnin */}
          <div className="bg-slate-950/40 border border-slate-900 p-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5"><span>Isnin</span> <span className="font-bold text-slate-400">80 Hit</span></div>
            <div className="w-full bg-slate-900/60 h-1 rounded-none overflow-hidden"><div className="bg-slate-700 h-full w-[45%]" /></div>
          </div>
          {/* Hari Selasa */}
          <div className="bg-slate-950/40 border border-slate-900 p-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5"><span>Selasa</span> <span className="font-bold text-slate-400">120 Hit</span></div>
            <div className="w-full bg-slate-900/60 h-1 rounded-none overflow-hidden"><div className="bg-slate-700 h-full w-[75%]" /></div>
          </div>
          {/* Hari Rabu */}
          <div className="bg-slate-950/40 border border-slate-900/80 p-3 shadow-inner">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5"><span>Rabu (Hari Ini)</span> <span className="text-emerald-400 font-bold">143 Hit</span></div>
            <div className="w-full bg-slate-900/60 h-1 rounded-none overflow-hidden"><div className="bg-emerald-500/80 h-full w-[95%]" /></div>
          </div>
        </div>
      </div>
      {/* Tamat: Segmen 1 - Analutik Piksel Moden (Bento Grid View) */}

      {/* Mula: Segmen 2 - Tetapan Status & Lencana (Sleek Rows) */}
      <div className="px-5 pb-1 space-y-4 select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/30 border border-slate-900/60 p-3 flex flex-col justify-between gap-2">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">🎭 Set Status Emosi (Mood)</label>
            <div className="flex gap-2 w-full">
              <select value={moodPilihan} onChange={(e) => setMoodPilihan(e.target.value)} className="bg-slate-950 border border-slate-900 text-[11px] px-2 py-1 text-slate-300 focus:outline-none rounded-none font-mono">
                <option value="☕">☕ Coding</option>
                <option value="🏍️">🏍️ Merempit</option>
                <option value="🔥">🔥 Membakar</option>
                <option value="💻">⚡ Siber</option>
              </select>
              <input type="text" value={moodTeksInput} onChange={(e) => setMoodTeksInput(e.target.value)} placeholder="Status Emosi Anda..." className="flex-1 bg-slate-950 border border-slate-900 px-2.5 py-1 text-[11px] text-white placeholder-slate-700 focus:outline-none font-mono rounded-none" />
            </div>
          </div>
          
          <div className="bg-slate-950/30 border border-slate-900/60 p-3 flex flex-col justify-between gap-2">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">🛡️ Rekod Lencana Mikro (88x31 url)</label>
            <input type="text" placeholder="https://imgur.com/lencana-anda.gif" className="w-full bg-slate-950 border border-slate-900 px-3 py-1.5 text-[11px] text-white focus:outline-none placeholder:text-slate-800 font-mono rounded-none" />
          </div>
        </div>
      </div>
      {/* Tamat: Segmen 2 - Tetapan Status & Lencana (Sleek Rows) */}

      {/* Mula: Segmen 3 - Core Editor Studio & Inline Music Action */}
      <div className="pt-2">
        {/* Editor Sub-Header Bar */}
        <div className="bg-slate-900/40 px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-b border-slate-900/80 font-mono text-xs text-slate-400 select-none gap-2">
          <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
            <span className="w-1 h-1 rounded-full bg-blue-400"></span>
            workspace_notepad.sys {failAktif ? `(active: ${failAktif.path})` : ""}
          </span>
          <button onClick={handleMuatTemplateAsas} type="button" className="bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold px-3 py-1 transition-all rounded-none self-start sm:self-center">
            ⚙️ Use Retro Template
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Mula: Editor Kod Mengalir & Suntikan Muzik Penjuru Atas */}
          <div className="border border-slate-900/80 bg-slate-950/60 flex flex-col">
            
            {/* Master Mini Bar Atas Editor: Memuatkan Fungsi Suntik Lagu yang super ringkas */}
            <div className="bg-slate-950/80 p-2 border-b border-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 px-1 select-none font-bold uppercase tracking-tight">
                [code_editor_terminal]
              </span>
              
              {/* Sleek Row Input YouTube Music */}
              <div className="flex items-center gap-1.5 self-stretch lg:self-auto">
                <input 
                  type="text" 
                  placeholder="🎵 Paste Youtube Link Latar..." 
                  value={inputLagu} 
                  onChange={(e) => setInputLagu(e.target.value)} 
                  className="bg-slate-900/80 border border-slate-900 px-2 py-1 text-[10px] text-slate-300 placeholder-slate-700 focus:outline-none w-full lg:w-48 font-mono rounded-none" 
                />
                <button 
                  onClick={handleSuntikMuzikLatar}
                  type="button"
                  className="bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-pink-500/50 text-slate-400 hover:text-pink-400 px-3 py-1 font-bold text-[9px] uppercase tracking-wider transition-all rounded-none whitespace-nowrap"
                >
                  Suntik
                </button>
              </div>
            </div>
            
            {/* Notifikasi Lencana Lagu */}
            {notifikasiLagu && ( 
              <div className="bg-slate-950 border-b border-slate-900 text-center py-1 select-none">
                <span className="text-[10px] font-bold text-yellow-500 animate-pulse font-mono">{notifikasiLagu}</span> 
              </div>
            )}

            {/* Form Penghantaran Kod & Textarea Monokrom Malap */}
            <form onSubmit={handleSimpanKeR2} className="p-0 m-0">
              <div className="relative">
                <textarea 
                  rows={15} 
                  value={kodHtml} 
                  onChange={(e) => setKodHtml(e.target.value)} 
                  className="w-full bg-black/40 text-slate-400 focus:text-slate-200 p-4 font-mono text-xs border-0 focus:outline-none resize-none shadow-inner leading-normal selection:bg-slate-800" 
                />
              </div>

              {/* Master Save Button */}
              <div className="p-3 bg-slate-900/20 border-t border-slate-900/80 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-slate-400 hover:text-emerald-400 font-black py-2 px-5 text-[11px] uppercase transition-all rounded-none select-none active:scale-[0.99] disabled:opacity-40"
                >
                  {loading ? "⏳ Menyimpan fail..." : `🚀 Kunci data :: [ ${failAktif?.name.toUpperCase()} ]`}
                </button>
              </div>
            </form>
          </div>
          {/* Tamat: Editor Kod Mengalir & Suntikan Muzik Penjuru Atas */}
        </div>
      </div>
      {/* Tamat: Segmen 3 - Core Editor Studio & Inline Music Action */}

    </div>
    // Tamat: Transformasi Master Kerangka Bento Workspace Studio 2026
  );
}