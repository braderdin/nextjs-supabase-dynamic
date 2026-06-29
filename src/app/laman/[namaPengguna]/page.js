import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js"; // ➔ TAMBAHAN: Import Supabase untuk Server Component
import KomponenKomenDanKaunter from "../../../components/KomponenKomenDanKaunter";
import WidgetJiranIntim from "../../../components/WidgetJiranIntim"; // ➔ TAMBAHAN: Import Komponen Modular Top 8

// Inisialisasi Hubungan R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Inisialisasi Hubungan Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi pembantu untuk menukar penstriman data R2 (Stream) menjadi teks HTML biasa
async function tukarStreamKeTeks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function LamanWargaSiber({ params }) {
  // Ambil nama folder pengguna dari URL dynamic route dengan selamat (Next.js 15 async)
  const { namaPengguna } = await params; 
  const namaFail = `${namaPengguna.toLowerCase()}/index.html`;

  let senaraiJiranIntim = [];

  try {
    // ➔ TAMBAHAN LOGIK: Dapatkan ID profil tuan tanah teratak ini
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      // ➔ TAMBAHAN LOGIK: Tarik senarai jiran intim yang telah ditetapkan oleh tuan tanah
      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
      
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }
    }

    // 2. Arahkan sistem untuk ambil fail index.html dari folder warga di R2
    const arahanAmbil = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFail,
    });

    const responR2 = await r2Client.send(arahanAmbil);
    
    // 3. Tukar data binary R2 kepada teks HTML mentah
    const kodHtmlAsli = await tukarStreamKeTeks(responR2.Body);

    // 4. MAGIS UTAMA: Pancarkan kod HTML asli, Widget Top 8, serta Buku Pelawat!
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        {/* Paparan Teratak HTML Bebas Rekaan Warga */}
        <div dangerouslySetInnerHTML={{ __html: kodHtmlAsli }} />

        {/* ➔ TAMBAHAN UI: Letakkan Widget Jiran Intim Top 8 di bawah teratak (Lebar diselaraskan dengan Buku Pelawat) */}
        <div className="max-w-xl w-full mx-auto px-4 mt-8">
          <WidgetJiranIntim senaraiJiran={senaraiJiranIntim} />
        </div>

        {/* Suntikan Blok Komuniti (Buku Pelawat + Kaunter LED + Lencana Sahabat) */}
        <KomponenKomenDanKaunter namaPengguna={namaPengguna} />
      </div>
    );

  } catch (error) {
    // 5. Paparan reka bentuk jika folder teratak tidak dijumpai di R2
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900 border-2 border-red-500 p-6 max-w-md shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ TERATAK TIDAK DIJUMPAI</p>
          <p className="mb-4 leading-relaxed">
            Maaf abangku, teratak siber bernama <span className="text-pink-400 font-bold">@{namaPengguna}</span> belum wujud dalam direktori baldi R2 atau telah berpindah kampung.
          </p>
          <a 
            href="/" 
            className="inline-block bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 px-4 py-2 font-bold transition-all text-[11px]"
          >
            ➔ BALIK KE TERAJU UTAMA
          </a>
        </div>
      </div>
    );
  }
}