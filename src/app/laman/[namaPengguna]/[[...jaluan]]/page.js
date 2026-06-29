import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import Link from 'next/next';
import KomponenKomenDanKaunter from "../../../components/KomponenKomenDanKaunter";
import WidgetJiranIntim from "../../../components/WidgetJiranIntim";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function tukarStreamKeTeks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function LamanWargaSiber({ params }) {
  // Ambil parameter URL secara asinkronus mengikut standard Next.js 15
  const resolvedParams = await params;
  const namaPengguna = resolvedParams.namaPengguna;
  const jaluan = resolvedParams.jaluan;

  // ➔ ENJIN PENYELESAIAN LALUAN: Gabungkan array segmen URL menjadi string path R2
  // Jika pelawat buka /laman/abangdin -> jaluan bernilai undefined -> kita hantar index.html
  const subPathFail = jaluan && jaluan.length > 0 ? jaluan.join('/') : 'index.html';
  const namaFailFull = `${namaPengguna.toLowerCase()}/${subPathFail}`;

  let senaraiJiranIntim = [];
  try {
    // Tarik profil tuan tanah & senarai Top 8 Jiran Intim (Kekal selamat)
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
           
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }
    }

    // Ambil fail spesifik (HTML/CSS/JS/TXT) dari baldi Cloudflare R2 secara dinamik
    const arahanAmbil = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFailFull,
    });
    
    const responR2 = await r2Client.send(arhanAmbil);
    const kodIsiAsli = await tukarStreamKeTeks(responR2.Body);

    // ➔ STRATEGI PENYAMPAIAN: Hanya suntik Buku Pelawat jika fail yang dibuka adalah index.html
    const adakahLamanUtama = subPathFail === 'index.html';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        {/* Pancarkan kod sumber asli fail dari R2 */}
        <div dangerouslySetInnerHTML={{ __html: kodIsiAsli }} />
        
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
    // Paparan ralat retro jika fail spesifik tidak wujud di R2
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