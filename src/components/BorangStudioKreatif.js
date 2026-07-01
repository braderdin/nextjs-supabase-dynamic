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
    // Mula: Kerangka Master Workspace Studio Minimalis 2026
    <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-0 font-mono text-xs text-slate-300 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] space-y-4 rounded-none transition-all">
      
      {/* Mula: Analutik Piksel Moden - Kad Bento Mini Bar Kelabu-Slate Rata */}
      <div className="p-5 bg-slate-900/10 border-b border-slate-900/60 select-none">
        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          vfs_analytics::live_traffic_feed
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bento Isnin */}
          <div className="bg-slate-950/30 border border-slate-900/80 p-3 flex flex-col justify-between h-14">
            <div className="flex justify-between text-[10px] text-slate-500"><span>Isnin</span> <span className="font-semibold text-slate-400">80 Hit</span></div>
            <div className="w-full bg-slate-900/40 h-[2px] rounded-none overflow-hidden"><div className="bg-slate-700 h-full w-[45%]" /></div>
          </div>
          {/* Bento Selasa */}
          <div className="bg-slate-950/30 border border-slate-900/80 p-3 flex flex-col justify-between h-14">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5"><span>Selasa</span> <span className="font-bold text-slate-400">120 Hit</span></div>
            <div className="w-full bg-slate-900/40 h-[2px] rounded-none overflow-hidden"><div className="bg-slate-700 h-full w-[75%]" /></div>
          </div>
          {/* Bento Rabu (Hari Ini) */}
          <div className="bg-slate-900/40 border border-slate-800 p-3 flex flex-col justify-between h-14 shadow-inner">
            <div className="flex justify-between items-center text-[10px] text-slate-400"><span>Rabu (Hari Ini)</span> <span className="text-emerald-400 font-bold">143 Hit</span></div>
            <div className="w-full bg-slate-950 h-[2px] rounded-none overflow-hidden"><div className="bg-slate-500 h-full w-[95%]" /></div>
          </div>
        </div>
      </div>
      {/* Tamat: Analutik Piksel Moden - Kad Bento Mini Bar Kelabu-Slate Rata */}

      {/* Mula: Tetapan Status & Lencana (Sleek Row Layout) */}
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
      {/* Tamat: Tetapan Status & Lencana (Sleek Row Layout) */}

      {/* Mula: Editor Kod Mengalir Mod Full-Bleed Bento */}
      <div className="pt-2">
        {/* Sub-Header Toolbar Editor */}
        <div className="bg-slate-900/40 px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-b border-slate-900/80 font-mono text-xs text-slate-400 select-none gap-2">
          <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            workspace_notepad.sys {failAktif ? `(active: ${failAktif.path})` : ""}
          </span>
          <button onClick={handleMuatTemplateAsas} type="button" className="bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold px-3 py-1 transition-all rounded-none self-start sm:self-center">
            ⚙️ Use Retro Template
          </button>
        </div>
        
        {/* Mula: Form Penuh Mengalir Tanpa Padding Luar (Full-Bleed) */}
        <form onSubmit={handleSimpanKeR2} className="p-0 m-0 flex flex-col border-b border-slate-900/80">
          
          {/* Inline Action Bar & Input Lagu Latar Tersembunyi */}
          <div className="bg-slate-950/80 p-2 px-4 border-b border-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 select-none font-bold uppercase tracking-tight">
              [EDITOR_KANDUNGAN]: {failAktif?.name || "index.html"}
            </span>
            
            {/* Input YouTube Kompak */}
            <div className="flex items-center gap-1.5 self-stretch lg:self-auto select-none">
              <input 
                type="text" 
                placeholder="🎵 Youtube Music Link..." 
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
          
          {/* Ticker Notifikasi Suntikan */}
          {notifikasiLagu && ( 
            <div className="bg-slate-950 border-b border-slate-900 text-center py-1 select-none">
              <span className="text-[10px] font-bold text-yellow-500 animate-pulse font-mono">{notifikasiLagu}</span> 
            </div>
          )}

          {/* Kawasan Suntingan Textarea Monokrom Malap Full Width */}
          <div className="w-full relative">
            <textarea 
              rows={16} 
              value={kodHtml} 
              onChange={(e) => setKodHtml(e.target.value)} 
              className="w-full bg-black/20 text-slate-400 focus:text-slate-200 p-5 font-mono text-xs border-0 focus:outline-none resize-none leading-relaxed selection:bg-slate-900" 
            />
          </div>

          {/* Bar Notifikasi Status Pelayan & Tombol Simpan Master */}
          <div className="p-3 px-4 bg-slate-900/20 border-t border-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
            <div className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md font-mono">
              {statusR2 ? `[LOG]: ${statusR2}` : "[SISTEM]: Workspace bersedia."}
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-slate-400 hover:text-emerald-400 font-black py-2 px-5 text-[11px] uppercase transition-all rounded-none active:scale-[0.99] disabled:opacity-40 whitespace-nowrap"
            >
              {loading ? "⏳ Menyimpan fail..." : `🚀 Kunci data :: [ ${failAktif?.name.toUpperCase()} ]`}
            </button>
          </div>

        </form>
        {/* Tamat: Form Penuh Mengalir Tanpa Padding Luar (Full-Bleed) */}
      </div>
      {/* Tamat: Editor Kod Mengalir Mod Full-Bleed Bento */}

    </div>
    // Tamat: Transformasi Master Kerangka Bento Workspace Studio 2026
  );
}