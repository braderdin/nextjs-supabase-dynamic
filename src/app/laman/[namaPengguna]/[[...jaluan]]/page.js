import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import Link from 'next/link';  

import KomponenKomenDanKaunter from "@/components/KomponenKomenDanKaunter"; 
import WidgetJiranIntim from "@/components/WidgetJiranIntim"; 

// Mula: Inisialisasi Hubungan R2 Pelayan
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
}); 
// Tamat: Inisialisasi Hubungan R2 Pelayan

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function LamanWargaSiber({ params }) {
  const resolvedParams = await params;
  const namaPengguna = resolvedParams.namaPengguna;
  const jaluan = resolvedParams.jaluan;

  const subPathFail = jaluan && jaluan.length > 0 ? jaluan.join('/') : 'index.html';
  const namaFailFull = `${namaPengguna.toLowerCase()}/${subPathFail}`;

  let senaraiJiranIntim = [];
  let profilWujud = false;
  
  let dataMood = { ikon: "☕", teks: "Bertukang Kod Malam-Malam" };
  let senaraiLencana = [];
  let urlJiranKiri = "/";
  let urlJiranKanan = "/";
  let urlJiranRawak = "/";

  try {
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id, mood_ikon, mood_text, lencana_koleksi')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      profilWujud = true; 
      
      if (profil.mood_text) {
        dataMood = { teks: profil.mood_text, ikon: profil.mood_ikon || "☕" };
      }

      if (Array.isArray(profil.lencana_koleksi)) {
        senaraiLencana = profil.lencana_koleksi;
      }

      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
                  
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }

      const { data: seluruhWarga } = await supabase
        .from('warga_profil')
        .select('username')
        .order('username', { ascending: true });

      if (seluruhWarga && seluruhWarga.length > 1) {
        const indeksSemasa = seluruhWarga.findIndex(w => w.username.toLowerCase() === namaPengguna.toLowerCase());
        
        if (indeksSemasa !== -1) {
          const indeksKiri = indeksSemasa === 0 ? seluruhWarga.length - 1 : indeksSemasa - 1;
          const indeksKanan = indeksSemasa === seluruhWarga.length - 1 ? 0 : indeksSemasa + 1;
          
          let indeksRawak = Math.floor(Math.random() * seluruhWarga.length);
          while (indeksRawak === indeksSemasa && seluruhWarga.length > 1) {
            indeksRawak = Math.floor(Math.random() * seluruhWarga.length);
          }

          urlJiranKiri = `/laman/${seluruhWarga[indeksKiri].username}`;
          urlJiranKanan = `/laman/${seluruhWarga[indeksKanan].username}`;
          urlJiranRawak = `/laman/${seluruhWarga[indeksRawak].username}`;
        }
      }
    }

    // Mula: PEMBAIKAN JITU - Melonggarkan benteng kawalan profil pangkalan data
    let kodHtmlAsli = "";
    try {
      const arahanAmbil = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: namaFailFull,
      });
      const responR2 = await r2Client.send(arahanAmbil);
      const chunks = [];
      for await (const chunk of responR2.Body) {
        chunks.push(chunk);
      }
      kodHtmlAsli = Buffer.concat(chunks).toString("utf8");
    } catch (errR2) {
      const folderKeyFallback = `${namaFailFull.replace(/\/$/, '')}/index.html`;
      const arahanFolder = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: folderKeyFallback,
      });
      const responFolder = await r2Client.send(arahanFolder);
      const chunks = [];
      for await (const chunk of responFolder.Body) {
        chunks.push(chunk);
      }
      kodHtmlAsli = Buffer.concat(chunks).toString("utf8");
    }

    const skripResizerMurni = `
      <script>
        (function() {
          function hantarTinggiTeratak() {
            var tinggiSemasa = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.parent.postMessage({ type: 'KAMPUNG_SIBER_RESIZE', height: tinggiSemasa }, '*');
          }
          window.addEventListener('load', hantarTinggiTeratak);
          window.addEventListener('resize', hantarTinggiTeratak);
          if (window.MutationObserver) {
            var pemerhati = new MutationObserver(hantarTinggiTeratak);
            pemerhati.observe(document.body || document.documentElement, { subtree: true, childList: true, attributes: true });
          }
          setInterval(hantarTinggiTeratak, 600);
        })();
      </script>
    `;
    const kodHtmlDenganSkrip = kodHtmlAsli + skripResizerMurni;

    const adakahLamanUtama = subPathFail === 'index.html' || subPathFail === '';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('message', function(acara) {
            if (acara.data && acara.data.type === 'KAMPUNG_SIBER_RESIZE') {
              var teratakIframe = document.getElementById('teratak-iframe');
              if (teratakIframe) {
                teratakIframe.style.height = acara.data.height + 'px';
              }
            }
          });
        `}} />

        {/* Mula: Penyelarasan Status Mood Ticker Minimalis 2026 */}
        {adakahLamanUtama && (
          <div className="w-full bg-slate-950/60 backdrop-blur-md border-b border-slate-900/80 py-2.5 text-center font-mono text-xs text-slate-400 select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-slate-900/30 border border-slate-900 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              {dataMood.ikon} STATUS EMOSI: <span className="text-white font-bold uppercase">{dataMood.teks}</span>
            </span>
          </div>
        )}
        {/* Tamat: Penyelarasan Status Mood Ticker Minimalis 2026 */}

        <div className="w-full bg-slate-950">
          <iframe 
            id="teratak-iframe"
            srcDoc={kodHtmlDenganSkrip}
            className="w-full border-0 block transition-all duration-200 ease-out"
            style={{ height: '600px', overflow: 'hidden' }}
            scrolling="no"
            sandbox="allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
          />
        </div>
        
        {adakahLamanUtama && (
          <>
            {/* Mula: Penyelarasan Bento Kad Lencana Warga 2026 */}
            <div className="max-w-xl w-full mx-auto px-4 mt-6 font-mono text-xs select-none">
              <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)]">
                <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-pink-500"></span>
                  warga_badges::showcase
                </h3>
                <div className="flex flex-wrap gap-2 bg-slate-950/60 p-3 border border-slate-900 justify-center">
                  <div className="w-[88px] h-[31px] bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 text-[8px] text-slate-400 text-center flex items-center justify-center font-bold uppercase">Warga Asli</div>
                  <div className="w-[88px] h-[31px] bg-transparent border border-dashed border-slate-900 text-[8px] text-slate-700 text-center flex items-center justify-center font-medium uppercase">Slot Empty</div>
                </div>
              </div>
            </div>
            {/* Tamat: Penyelarasan Bento Kad Lencana Warga 2026 */}

            <div className="max-w-xl w-full mx-auto px-4 mt-6">
              <WidgetJiranIntim senaraiJiran={senaraiJiranIntim} />
            </div>

            {/* Mula: Penyelarasan Navigasi Webring Kampung 2026 Teks Murni */}
            <div className="max-w-xl w-full mx-auto px-4 mt-6 font-mono text-xs select-none">
              <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-4 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] text-center space-y-3">
                <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-bold">
                  🔗 rangkaian_webring_komuniti
                </span>
                <div className="flex justify-center items-center gap-1.5 pt-0.5">
                  <Link href={urlJiranKiri} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 px-3 py-1.5 font-bold text-slate-400 hover:text-white text-[10px] transition-all">◀ JIRAN KIRI</Link>
                  <Link href={urlJiranRawak} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 px-3 py-1.5 font-bold text-emerald-400 hover:text-emerald-300 text-[10px] transition-all">🎲 TERATAK RAWAK</Link>
                  <Link href={urlJiranKanan} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 px-3 py-1.5 font-bold text-slate-400 hover:text-white text-[10px] transition-all">JIRAN KANAN ▶</Link>
                </div>
              </div>
            </div>
            {/* Tamat: Penyelarasan Navigasi Webring Kampung 2026 Teks Murni */}

            <KomponenKomenDanKaunter namaPengguna={namaPengguna} />
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Ralat dikesan pada LamanWargaSiber:", error);
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900/40 border border-red-950 p-6 max-w-md shadow-sm">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ FAIL / TERATAK TIDAK DIJUMPAI</p>
          <p className="mb-4 leading-relaxed text-slate-500 font-sans">
            Maaf abangku, fail <span className="text-red-400 font-mono font-bold">"{subPathFail}"</span> tiada dalam arkib teratak <span className="text-white font-bold">@{namaPengguna}</span>.
          </p>
          <Link href="/" className="inline-block bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 font-bold transition-all text-[11px]">
            BALIK KE TERAJU UTAMA
          </Link>
        </div>
      </div>
    );
  }
}