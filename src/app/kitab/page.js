"use client";

import MarqueePengumuman from '../../components/MarqueePengumuman';
import MenuNavigasiSiber from '../../components/MenuNavigasiSiber';

export default function KitabHTML() {
  const senaraiPelajaran = [
    {
      bab: "BAB 1: Asas Tajuk & Perenggan",
      penerangan: "Gunakan tag ini untuk membuat tulisan tajuk yang besar atau teks biasa.",
      kod: `<h1>Tajuk Paling Besar Abangku</h1>\n<h2>Tajuk Sederhana Besar</h2>\n<p>Ini adalah teks perenggan biasa.</p>`
    },
    {
      bab: "BAB 2: Teks Berwarna & Gaya",
      penerangan: "Ubah warna tulisan menggunakan gaya inline CSS di dalam tag HTML.",
      kod: `<h1 style="color: pink;">Tulisan Warna Pink Comel</h1>\n<p style="color: cyan; font-weight: bold;">Teks Tebal Warna Cyan</p>`
    },
    {
      bab: "BAB 3: Elemen Klasik Era 90-an",
      penerangan: "Tag lagenda untuk membuat teks bergerak dan garisan pemisah vintaj.",
      kod: `<marquee>Teks ini akan bergerak ke kiri secara ajaib! ✨</marquee>\n<hr />`
    },
    // ➔ AJARAN BARU: TEKNIK EMBED GAMBAR IMGUR SECARA COMEL
    {
      bab: "BAB 4: Memasang Gambar Comel (Pautan Imgur)",
      penerangan: "Platform tidak membenarkan muat naik fail gambar terus. Sila muat naik gambar anda di Imgur.com, salin pautan imej tersebut, dan letakkan kod sempadan (border-resize) seperti di bawah:",
      kod: `<img \n  src="https://i.imgur.com/SebabContohGambar.png" \n  alt="Gambar Comel Saya" \n  style="width: 100%; max-width: 300px; border: 4px solid #ec4899; padding: 4px;"\n/>`
    },
    // ➔ AJARAN BARU: TEKNIK EMBED VIDEO YOUTUBE SECARA SELAMAT
    {
      bab: "BAB 5: Memasang Wayar Video (Embed YouTube)",
      penerangan: "Untuk memasang lagu atau video kegemaran tanpa membebani server, gunakan kod iFrame kongsi rasmi daripada YouTube dan sesuaikan lebar saiznya mengikut skrin telefon:",
      kod: `<iframe \n  width="100%" \n  height="200" \n  src="https://www.youtube.com/embed/SebabIdVideoLagu" \n  style="border: 3px double #3b82f6;"\n></iframe>`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      <MarqueePengumuman />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#10b981]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-emerald-400 uppercase tracking-tight">
            📜 KITAB HTML WARGA SIBER
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Buku nota panduan kod asas untuk menghias Teratak Digital anda. Salin, ubah, dan tampal!
          </p>
        </div>

        <MenuNavigasiSiber />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          <div className="lg:col-span-3 space-y-6">
            {senaraiPelajaran.map((pelajaran, indeks) => (
              <div key={indeks} className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#a855f7]">
                <div className="bg-slate-800 px-4 py-1.5 flex items-center justify-between border-b border-slate-800 font-mono text-[11px] text-slate-300 select-none">
                  <span>📄 nota_pelajaran_0{indeks + 1}.txt</span>
                  <span className="text-[10px] text-purple-400">AKTIF</span>
                </div>
                
                <div className="p-4 md:p-6 space-y-3">
                  <h2 className="text-base font-bold font-mono text-purple-400">
                    {pelajaran.bab}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pelajaran.penerangan}
                  </p>
                  
                  <div className="relative group">
                    <pre className="bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-yellow-300 overflow-x-auto whitespace-pre-wrap rounded-none shadow-inner">
                      <code>{pelajaran.kod}</code>
                    </pre>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-2 py-0.5 text-[9px] text-slate-400 font-mono select-none">
                      CTRL + C untuk salin
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#ec4899] p-4 font-mono text-xs space-y-4 sticky top-6">
            <h3 className="text-xs font-bold text-pink-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
              💡 Tip Pengaturcara
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Semua tag HTML wajib dibuka dengan tanda <code className="text-yellow-400">&lt;tag&gt;</code> dan ditutup semula dengan tanda <code className="text-yellow-400">&lt;/tag&gt;</code> supaya reka bentuk teratak anda tidak hancur atau rosak.
            </p>
            <div className="p-2.5 bg-slate-950 border border-slate-800 text-[10px] text-slate-500 text-center uppercase font-bold text-red-400 tracking-wide border-dashed">
              ⚠️ Saiz kod maksimum dibenarkan bagi setiap warga adalah 50KB sahaja demi keselamatan.
            </div>
          </div>

        </div>

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}