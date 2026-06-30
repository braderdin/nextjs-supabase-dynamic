import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import Link from 'next/link';  

// ➔ PENYELESAIAN ABADI: Guna Absolute Import (@/) untuk elak pening mengira anak tangga folder!
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

  // Menyusun semula laluan fail secara dinamik
  const subPathFail = jaluan && jaluan.length > 0 ? jaluan.join('/') : 'index.html';
  const namaFailFull = `${namaPengguna.toLowerCase()}/${subPathFail}`;

  let senaraiJiranIntim = [];
  let profilWujud = false;

  try {
    // =====================================================================
    // Mula: Semakan Profil Warga & Jiran Intim via Supabase
    // =====================================================================
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      profilWujud = true; 
      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
                  
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }
    }
    // =====================================================================
    // Tamat: Semakan Profil Warga & Jiran Intim via Supabase
    // =====================================================================

    if (!profilWujud) {
      throw new Error("Profil siber ghaib abangku!");
    }

    // =====================================================================
    // Mula: PEMBAIKAN JITU - Ambil Kandungan Fail/Folder Dari Cloudflare R2 secara Terus
    // =====================================================================
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
    // =====================================================================
    // Tamat: PEMBAIKAN JITU - Ambil Kandungan Fail/Folder Dari Cloudflare R2 secara Terus
    // =====================================================================

    // =====================================================================
    // Mula: Suntikan Skrip Pengesan Ketinggian Teratak untuk Komunikasi Silang
    // =====================================================================
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
    // =====================================================================
    // Tamat: Suntikan Skrip Pengesan Ketinggian Teratak untuk Komunikasi Silang

    const adakahLamanUtama = subPathFail === 'index.html' || subPathFail === '';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        
        {/* ===================================================================== */}
        {/* Mula: Skrip Pembantu Induk Mendengar Isyarat postMessage pada Skrin Warga */}
        {/* ===================================================================== */}
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
        {/* ===================================================================== */}
        {/* Tamat: Skrip Pembantu Induk Mendengar Isyarat postMessage pada Skrin Warga */}

        {/* ===================================================================== */}
        {/* Mula: Paparan Iframe Sandboxed Bersama Konfigurasi Seamless Bersatu */}
        {/* ===================================================================== */}
        <div className="w-full bg-slate-950">
          <iframe 
            id="teratak-iframe"
            srcDoc={kodHtmlDenganSkrip}
            className="w-full border-0 block transition-all duration-200 ease-out"
            style={{ height: '600px', overflow: 'hidden' }}
            scrolling="no"
            // ➔ ✅ KEKAL SELAMAT: Token allow-top-navigation-by-user-activation dikekalkan demi kelancaran perpindahan menu
            sandbox="allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
          />
        </div>
        {/* ===================================================================== */}
        {/* Tamat: Paparan Iframe Sandboxed Bersama Konfigurasi Seamless Bersatu */}
        
        {adakahLamanUtama && (
          <>
            <div className="max-w-xl w-full mx-auto px-4 mt-8">
              <WidgetJiranIntim senaraiJiran={senaraiJiranIntim} />
            </div>
            <KomponenKomenDanKaunter namaPengguna={namaPengguna} />
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900 border-2 border-red-500 p-6 max-w-md shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ FAIL / TERATAK TIDAK DIJUMPAI</p>
          <p className="mb-4 leading-relaxed">
            Maaf abangku, fail <span className="text-pink-400 font-bold">"{subPathFail}"</span> tiada dalam arkib teratak <span className="text-yellow-400 font-bold">@{namaPengguna}</span>.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 px-4 py-2 font-bold transition-all text-[11px]"
          >
            BALIK KE TERAJU UTAMA
          </Link>
        </div>
      </div>
    );
  }
}