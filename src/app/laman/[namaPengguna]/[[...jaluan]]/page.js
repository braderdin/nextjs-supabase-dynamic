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
  
  // Mula: Inisialisasi Pemboleh Ubah Fasa 3 Webring & Mood
  let dataMood = { ikon: "☕", teks: "Bertukang Kod Malam-Malam" };
  let senaraiLencana = [];
  let urlJiranKiri = "/";
  let urlJiranKanan = "/";
  let urlJiranRawak = "/";
  // Tamat: Inisialisasi Pemboleh Ubah Fasa 3 Webring & Mood

  try {
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id, mood_ikon, mood_text, lencana_koleksi')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      profilWujud = true; 
      
      // Mula: PEMBAIKAN JITU - Pembetulan ejaan & penetapan data mood
      if (profil.mood_text) {
        dataMood = { teks: profil.mood_text, ikon: profil.mood_ikon || "☕" };
      }

      if (Array.isArray(profil.lencana_koleksi)) {
        senaraiLencana = profil.lencana_koleksi;
      }
      // Tamat: PEMBAIKAN JITU - Pembetulan ejaan & penetapan data mood

      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
                  
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }

      // =====================================================================
      // Mula: PEMBAIKAN JITU - Algoritma Webring Rangkaian Kampung Siber
      // =====================================================================
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
      // =====================================================================
      // Tamat: PEMBAIKAN JITU - Algoritma Webring Rangkaian Kampung Siber
    }

    if (!profilWujud) {
      throw new Error("Profil siber ghaib abangku!");
    }

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

        {/* Mula: Paparan Widget Status Emosi (Mood) Berkelip Dinamik */}
        {adakahLamanUtama && (
          <div className="w-full bg-slate-900 border-b border-slate-800 py-2 text-center font-mono text-xs text-yellow-400 select-none">
            <span className="animate-pulse bg-yellow-500/10 px-3 py-1 border border-yellow-500/30">
              {dataMood.ikon} STATUS EMOSI TERATAK: <span className="text-white font-bold uppercase">{dataMood.teks} {dataMood.ikon}</span>
            </span>
          </div>
        )}
        {/* Tamat: Paparan Widget Status Emosi (Mood) Berkelip Dinamik */}

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
            {/* Mula: Paparan Pasar Karat Lencana (Badge Collect Component) */}
            <div className="max-w-xl w-full mx-auto px-4 mt-6 font-mono text-xs select-none">
              <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308] p-4">
                <h3 className="text-yellow-400 font-bold mb-3 uppercase tracking-wider text-[11px]">🛡️ Pasar Karat Lencana (88x31 Friend Badges)</h3>
                <div className="flex flex-wrap gap-2 bg-slate-950 p-3 border border-slate-850 justify-center">
                  <div className="w-[88px] h-[31px] bg-gradient-to-r from-pink-500 to-purple-600 border border-white text-[7px] text-center flex items-center justify-center font-black uppercase">Warga Asli</div>
                  <div className="w-[88px] h-[31px] bg-slate-900 border border-slate-700 text-[7px] text-slate-500 text-center flex items-center justify-center">Slot Kosong</div>
                </div>
              </div>
            </div>
            {/* Tamat: Paparan Pasar Karat Lencana (Badge Collect Component) */}

            <div className="max-w-xl w-full mx-auto px-4 mt-8">
              <WidgetJiranIntim senaraiJiran={senaraiJiranIntim} />
            </div>

            {/* Mula: Paparan Bar Butang Webring Kampung Rangkaian Teratak */}
            <div className="max-w-xl w-full mx-auto px-4 mt-6 font-mono text-xs select-none">
              <div className="bg-slate-900 border-2 border-slate-800 p-3 shadow-[4px_4px_0px_0px_#ec4899] text-center space-y-2">
                <span className="text-[10px] text-slate-400 block uppercase tracking-widest">🕸️ RANGKAIAN WEBRING KAMPUNG SIBER 🕸️</span>
                <div className="flex justify-center gap-2 pt-1">
                  <Link href={urlJiranKiri} className="bg-slate-950 border border-slate-800 hover:border-pink-500 px-3 py-1.5 font-bold text-pink-400 text-[10px]">◀️ JIRAN KIRI</Link>
                  <Link href={urlJiranRawak} className="bg-slate-950 border border-yellow-500 hover:bg-yellow-500 hover:text-black px-3 py-1.5 font-bold text-yellow-400 text-[10px]">🎲 TERATAK RAWAK</Link>
                  <Link href={urlJiranKanan} className="bg-slate-950 border border-slate-800 hover:border-pink-500 px-3 py-1.5 font-bold text-pink-400 text-[10px]">JIRAN KANAN ▶️</Link>
                </div>
              </div>
            </div>
            {/* Tamat: Paparan Bar Butang Webring Kampung Rangkaian Teratak */}

            <KomponenKomenDanKaunter namaPengguna={namaPengguna} />
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Ralat dikesan pada LamanWargaSiber:", error);
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900 border-2 border-red-500 p-6 max-w-md shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ FAIL / TERATAK TIDAK DIJUMPAI</p>
          <p className="mb-4 leading-relaxed">
            Maaf abangku, fail <span className="text-pink-400 font-bold">"{subPathFail}"</span> tiada dalam arkib teratak <span className="text-yellow-400 font-bold">@{namaPengguna}</span>.
          </p>
          <Link href="/" className="inline-block bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 px-4 py-2 font-bold transition-all text-[11px]">
            BALIK KE TERAJU UTAMA
          </Link>
        </div>
      </div>
    );
  }
}