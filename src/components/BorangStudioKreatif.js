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
      setNotifikasiLagu("🎉 Muzik latar belakang berjaya disuntik ke dalam HTML abang!");
      setTimeout(() => setNotifikasiLagu(""), 4000);
    } else {
      setNotifikasiLagu("❌ Alamak abangku! Alamat pautan YouTube tidak sah. Cuba lagi.");
    }
  }

  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#10b981] space-y-6">
      
      <div className="p-6 bg-slate-950 m-4 border border-slate-850 font-mono select-none">
        <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider mb-3">📊 BILIK KAWALAN: ANALUTIK PIKSEL TERATAK</span>
        <div className="space-y-3 bg-black p-4 border border-slate-900">
          <span className="text-[11px] text-slate-400 block">Kadar Trafik Tontonan Mingguan (Skala Piksel):</span>
          <div className="space-y-2 pt-2">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Isnin</span> <span>80 Hit</span></div>
              <div className="w-full bg-slate-950 h-3 border border-slate-900"><div className="bg-emerald-500 h-full w-[45%]" /></div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Selasa</span><span>120 Hit</span></div>
              <div className="w-full bg-slate-950 border border-slate-900 h-3"><div className="bg-emerald-500 h-full w-[75%]" /></div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1"><span>Rabu (Hari Ini)</span> <span className="text-yellow-400 font-bold">143 Hit</span></div>
              <div className="w-full bg-slate-950 border border-slate-900 h-3"><div className="bg-yellow-400 h-full w-[95%]" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-6 p-4 bg-slate-950 border border-slate-850 font-mono space-y-4 select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-pink-400 uppercase mb-1.5">🎭 SET STATUS EMOSI (MOOD)</label>
            <div className="flex gap-2">
              <select value={moodPilihan} onChange={(e) => setMoodPilihan(e.target.value)} className="bg-slate-900 border border-slate-800 text-xs px-2 py-2 text-white focus:outline-none">
                <option value="☕">☕ Coding</option>
                <option value="🏍️">🏍️ Merempit</option>
                
                {/* Mula: PEMBAIKAN JITU - Mengubah elemen dt menjadi tag option select siber yang sah */}
                <option value="🔥">🔥 Membakar</option>
                {/* Tamat: PEMBAIKAN JITU - Mengubah elemen dt menjadi tag option select siber yang sah */}
                
                <option value="💻">⚡ Siber</option>
              </select>
              <input type="text" value={moodTeksInput} onChange={(e) => setMoodTeksInput(e.target.value)} placeholder="Status Emosi Anda..." className="flex-1 bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-pink-400 uppercase mb-1.5">🛡️ REKOD LENCANA MIKRO (88X31 URL)</label>
            <input type="text" placeholder="https://imgur.com/lencana-anda.gif" className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none placeholder:text-slate-800" />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
        <span className="flex items-center gap-2 text-emerald-400 font-bold">
          📝 studio_kreatif_notepad.sys {failAktif ? `(Menyunting: ${failAktif.path})` : ""}
        </span>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <p className="text-xs text-slate-400 font-mono">[EDITOR]: Kandungan kod di bawah adalah milik fail <span className="text-yellow-400 font-bold">{failAktif?.name || "index.html"}</span>.</p>
          <button onClick={handleMuatTemplateAsas} className="w-full sm:w-auto bg-slate-950 border border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-400 text-[10px] font-mono font-black px-3 py-1.5 transition-all">⚙️ GUNAKAN TEMPLATE ASAS RETRO</button>
        </div>

        <div className="mb-6 p-4 bg-slate-950 border border-slate-850 font-mono">
          <label className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1.5">🎵 PAUTAN LAGU LATAR BELAKANG (YOUTUBE URL)</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ" value={inputLagu} onChange={(e) => setInputLagu(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 placeholder:text-slate-700 font-mono" />
            <button onClick={handleSuntikMuzikLatar} className="bg-slate-900 border border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 text-[10px] uppercase font-black px-4 py-2 transition-all whitespace-nowrap">⚡ SUNTIK KOD MUZIK</button>
          </div>
          {notifikasiLagu && ( <span className="block text-[10px] font-bold text-yellow-400 mt-2 animate-pulse">{notifikasiLagu}</span> )}
        </div>

        <form onSubmit={handleSimpanKeR2} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">📝 KOD SUMBER ({failAktif?.name.toUpperCase() || "INDEX.HTML"})</label>
            <textarea rows={14} value={kodHtml} onChange={(e) => setKodHtml(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 p-4 font-mono text-xs text-yellow-300 focus:outline-none resize-none shadow-inner" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-950 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-mono font-black py-3.5 px-4 text-xs uppercase transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
            {loading ? "⏳ SEDANG MENYIMPAN FAIL..." : `🚀 KUNCI KOD KE FAIL [ ${failAktif?.name.toUpperCase()} ]`}
          </button>
        </form>
      </div>
    </div>
  );
}