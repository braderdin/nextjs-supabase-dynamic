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
  failAktif // ➔ TAMBAHAN: Terima prop fail aktif dari parent
}) {
  const [inputLagu, setInputLagu] = useState("");
  const [notifikasiLagu, setNotifikasiLagu] = useState("");

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

  <fieldset style="border: 2px dashed #3b82f6; padding: 15px; margin-bottom: 20px;">
    <legend style="color: #3b82f6; font-weight: bold; padding: 0 5px;">📜 BIODATA WARGA</legend>
    <p><b>Nama:</b> ${namaPengguna || 'Anak Watan Siber'}</p>
    <p><b>Status:</b> Sedang Bertukang Kod Malam-Malam ☕</p>
    <p><b>Misi:</b> Menghias teratak siber paling kacak tanpa algoritma!</p>
  </fieldset>

  <div style="background-color: #0f172a; border: 1px solid #334155; padding: 15px; font-size: 12px; line-height: 1.6;">
    <h3 style="color: #f59e0b; margin-top: 0;">📝 TENTANG SAYA</h3>
    Salam perkenalan! Ini adalah laman web peribadi saya yang disimpan terus ke dalam storan Cloudflare R2 secara bebas iklan. Sila tinggalkan jejak digital anda di Buku Pelawat bawah ya!
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
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#10b981]">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
        {/* ➔ PERUBAHAN VISUAL: Memaparkan fail apa yang sedang diedit secara dinamik */}
        <span className="flex items-center gap-2 text-emerald-400 font-bold">
          📝 studio_kreatif_notepad.sys {failAktif ? `(Menyunting: ${failAktif.path})` : ""}
        </span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <p className="text-xs text-slate-400 font-mono">
            [EDITOR]: Kandungan kod di bawah adalah milik fail <span className="text-yellow-400 font-bold">{failAktif?.name || "index.html"}</span>.
          </p>
          <button 
            onClick={handleMuatTemplateAsas}
            className="w-full sm:w-auto bg-slate-950 border border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-400 text-[10px] font-mono font-black px-3 py-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(245,158,11,0.2)]"
          >
            ⚙️ GUNAKAN TEMPLATE ASAS RETRO
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-950 border border-slate-850 rounded-none font-mono">
          <label className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1.5">
            🎵 PAUTAN LAGU LATAR BELAKANG (YOUTUBE URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text"
              placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={inputLagu}
              onChange={(e) => setInputLagu(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 placeholder:text-slate-700 font-mono"
            />
            <button 
              onClick={handleSuntikMuzikLatar}
              className="bg-slate-900 border border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 text-[10px] uppercase font-black px-4 py-2 transition-all shadow-[2px_2px_0px_0px_rgba(236,72,153,0.3)] whitespace-nowrap"
            >
              ⚡ SUNTIK KOD MUZIK
            </button>
          </div>
          {notifikasiLagu && (
            <span className="block text-[10px] font-bold text-yellow-400 mt-2 animate-pulse">{notifikasiLagu}</span>
          )}
        </div>

        <form onSubmit={handleSimpanKeR2} className="space-y-5">
          <div className="hidden">
            <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              📂 NAMA TERATAK
            </label>
            <input 
              type="text"
              readOnly
              value={namaPengguna}
              onChange={(e) => setNamaPengguna(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              📝 KOD SUMBER ({failAktif?.name.toUpperCase() || "INDEX.HTML"})
            </label>
            <textarea 
              rows={14}
              value={kodHtml}
              onChange={(e) => setKodHtml(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-none p-4 font-mono text-xs text-yellow-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-mono font-black py-3.5 px-4 text-xs tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
          >
            {loading ? "⏳ SEDANG MENYIMPAN FAIL..." : `🚀 KUNCI KOD KE FAIL [ ${failAktif?.name.toUpperCase()} ]`}
          </button>
        </form>

        {statusR2 && (
          <div className="mt-5 text-xs font-mono p-4 bg-slate-950 border-2 border-dashed border-slate-800 text-slate-400 text-center flex flex-col items-center justify-center gap-2">
            <span>[SISTEM LOG]: {statusR2}</span>
            {lamanBerjaya && (
              <Link 
                href={`/laman/${lamanBerjaya}`} 
                target="_blank"
                className="mt-1 text-xs font-bold text-pink-400 hover:text-pink-300 underline bg-pink-500/10 px-3 py-1 border border-pink-500/20"
              >
                🌐 Klik Sini Untuk Melawat Teratak Siber Anda!
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}