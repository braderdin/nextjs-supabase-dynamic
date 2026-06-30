"use client";

import Link from "next/link";
import MarqueePengumuman from "../../components/MarqueePengumuman";
import MenuNavigasiSiber from "../../components/MenuNavigasiSiber";

export default function LamanDokumentasiWhitelist() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      {/* Mula: Marquee Pengumuman Atas Pelayan */}
      <MarqueePengumuman />
      {/* Tamat: Marquee Pengumuman Atas Pelayan */}

      <div className="max-w-5xl w-full mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-6 md:gap-8">
        
        {/* Mula: Kotak Tajuk Dokumentasi */}
        <div className="p-6 bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#3b82f6]">
          <h1 className="text-2xl md:text-3xl font-black font-mono text-blue-400 uppercase tracking-tight">
            📋 DOKUMENTASI FORMAT FAIL SAH (ALLOWED FILE TYPES)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Panduan rasmi struktur data dan format fail yang diluluskan untuk membina Teratak Siber.
          </p>
        </div>
        {/* Tamat: Kotak Tajuk Dokumentasi */}

        {/* Mula: Komponen Menu Navigasi Kampung */}
        <MenuNavigasiSiber />
        {/* Tamat: Komponen Menu Navigasi Kampung */}

        {/* Mula: Kontena Utama Kandungan Polisi */}
        <div className="w-full bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#3b82f6] font-mono text-xs p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-wider">
              🛡️ POLISI INTEGRITI STORAN RETRO
            </h2>
            <Link
              href="/"
              className="bg-slate-950 border-2 border-blue-500 text-blue-400 hover:bg-blue-400 hover:text-slate-950 px-4 py-1.5 font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(59,130,246,0.3)]"
            >
              ⬅️ KEMBALI KE WORKSPACE
            </Link>
          </div>

          {/* 🛡️ SEBAB SEKATAN FAIL */}
          <div className="bg-slate-950 p-4 border border-slate-800 leading-relaxed text-slate-300">
            <h3 className="text-yellow-400 font-bold uppercase mb-2">⚠️ Mengapa Terdapat Jenis Fail Terhad / Dilarang?</h3>
            <p className="mb-3">
              Pada masa ini, <b>Terataksiber</b> sedang berusaha untuk berkembang secara mampan. Matlamat kami adalah untuk memberi anda tapak web percuma supaya anda boleh mengatur kandungan dalam apa jua cara yang anda mahukan. Untuk memastikan kami dapat terus melakukan ini, kami perlu melaksanakan langkah-langkah untuk menghalang Terataksiber daripada menjadi <b>"hos pembuangan fail" (file dump host)</b>. Kami tidak mempunyai sumber untuk menangani dan menghalang perkara ini daripada berlaku jika kami membenarkan pengguna memuat naik apa sahaja yang mereka mahu, jadi penyelesaian sementara buat masa ini adalah dengan hanya membenarkan jenis fail yang kami tahu berguna untuk membuat tapak web statik.
            </p>
            <p className="mb-3">
              Contohnya, membenarkan pengguna untuk mengehos fail boleh laku <b>(EXE)</b> menyediakan cara untuk penyerang mengehoskan kandungan berniat jahat, dan kami mahu meminimumkannya. Selain itu, jika tapak mula digunakan untuk mengehoskan kandungan berniat jahat, ada kemungkinan enjin carian seperti Google akan menghukum kami dalam kedudukan (*ranking*), atau pengendali pusat data kami akan memberitahu kami bahawa kami tidak boleh menjalankan perniagaan dengan mereka, yang akan menjejaskan tapak semua orang di Terataksiber.
            </p>
            <p>
              Muzik <b>MP3</b> dan video <b>MP4</b> mempunyai masalah yang sama, kerana jika kandungan yang dimuat naik menjadi sangat popular ("menjadi viral"), ia akan mengatasi pelayan kami dan menjadikan lebar jalur (*bandwidth*) kami lebih mahal. Dan mengehos kandungan media kaya secara langsung hampir tidak pernah menjadi cara terbaik untuk melakukannya. <b>Soundcloud</b> menyediakan cara yang bagus untuk mengehoskan muzik, dan <b>Youtube</b> melakukan kerja yang sangat baik dengan mengambil video anda, memprosesnya, memastikan ia berfungsi pada semua penyemak imbas, dan kemudian menyediakan cara mudah untuk anda membenamkan (*embed*) kandungan tersebut dalam halaman web anda.
            </p>
          </div>

          {/* 🛠️ JADUAL TUTORIAL ASAS DAN FORMAT CODE */}
          <div className="space-y-4">
            <h3 className="text-pink-400 font-bold uppercase tracking-wider">🛠️ Kamus Struktur & Tutorial Asas Format Fail</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">📄 .html / .htm (Teras Web)</span>
                <p className="text-slate-400 text-[11px] mb-2">Nadi utama struktur kandungan laman web abang.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"<h1>Teratak Abang</h1>\n<p>Selamat datang geng!</p>"}</pre>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">🎨 .css (Gaya Kosmetik)</span>
                <p className="text-slate-400 text-[11px] mb-2">Zon menghias warna, sempadan retro, dan saiz teks.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"body {\n  background: black;\n  color: pink;\n}"}</pre>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">⚡ .js / .json (Skrip & Objek Data)</span>
                <p className="text-slate-400 text-[11px] mb-2">Untuk logik interaktif atau pemetaan data berstruktur.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"// Pemicu log\nconsole.log('Kampung Siber Sedia!');"}</pre>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">🖼️ .gif (Grafik Animasi Retro)</span>
                <p className="text-slate-400 text-[11px] mb-2">Gambar bergerak bervibe vintaj 90-an yang sangat ringan.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"<img src=\"hiasan.gif\" alt=\"Animasi\" />"}</pre>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">📝 .md / .markdown / .txt (Dokumentasi)</span>
                <p className="text-slate-400 text-[11px] mb-2">Teks murni yang selamat untuk diari atau nota arkib siber.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"# Catatan Hari Ini\n- Layan konvoi Karak\n- Siap R2 server"}</pre>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850">
                <span className="text-emerald-400 font-bold block mb-1">🔤 .woff / .woff2 / .ttf (Tipografi Font)</span>
                <p className="text-slate-400 text-[11px] mb-2">Fail font murni untuk memasang tulisan piksel/komputer klasik.</p>
                <pre className="bg-slate-900 p-2 text-yellow-300 text-[10px] overflow-x-auto">{"@font-face {\n  font-family: 'Retro';\n  src: url('font.woff2');\n}"}</pre>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-dashed border-blue-900 text-center text-slate-400 text-[11px]">
            📬 Jika anda mempunyai jenis fail yang anda percaya patut dibenarkan, sila hubungi kami di Pondok Siber dan kami akan melihat sama ada kami boleh meletakkannya untuk anda. Terima kasih!
          </div>
        </div>
        {/* Tamat: Kontena Utama Kandungan Polisi */}

      </div>

      <footer className="py-4 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12">
        Kampung Siber Komuniti • Dipersembahkan oleh braderdin dengan penuh minat
      </footer>
    </div>
  );
}