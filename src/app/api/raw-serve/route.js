import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Mula: Inisialisasi Hubungan R2 (Menggunakan kunci .env.local asal abang)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
// Tamat: Inisialisasi Hubungan R2

// Mula: Kamus Pemetaan MIME untuk Menyokong Kandungan Murni Web
const PEMETAAN_MIME = {
  'html': 'text/html; charset=utf-8',
  'htm': 'text/html; charset=utf-8',
  'css': 'text/css; charset=utf-8',
  'js': 'application/javascript; charset=utf-8',
  'json': 'application/json; charset=utf-8',
  'md': 'text/markdown; charset=utf-8',
  'markdown': 'text/markdown; charset=utf-8',
  'txt': 'text/plain; charset=utf-8',
  'text': 'text/plain; charset=utf-8',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'ttf': 'font/ttf',
  'woff': 'font/woff',
  'woff2': 'font/woff2'
};
// Tamat: Kamus Pemetaan MIME

// Fungsi pembantu untuk menukar data stream R2 kepada bentuk teks murni
async function streamKeTeks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const pathSpesifik = searchParams.get("path") || "index.html";

    if (!username) {
      return new Response("Username diperlukan abangku!", { status: 400 });
    }

    // Bersihkan sub-path laluan fail
    const subLaluanFail = pathSpesifik.replace(/^\/+/, '');
    let namaFailFull = `${username.toLowerCase()}/${subLaluanFail}`;
    let kodIsiAsli = "";
    let ekstensiFail = subLaluanFail.split('.').pop().toLowerCase();

    // =====================================================================
    // Mula: Enjin Imbasan & Directory Index Fallback (Surgical Fix)
    // =====================================================================
    try {
      // Cubaan 1: Cari fail fizikal secara tepat berdasarkan parameter laluan
      const arahanAmbil = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: namaFailFull,
      });
      const responR2 = await r2Client.send(arahanAmbil);
      kodIsiAsli = await streamKeTeks(responR2.Body);
    } catch (errFirstAttempt) {
      // Cubaan 2 (Fallback): Jika fail tiada, kemungkinan abang memanggil folder direktori (Contoh: /aboutme)
      // Kita auto-hala imbasan ke fail index.html di dalam folder tersebut
      const folderKeyFallback = `${namaFailFull.replace(/\/$/, '')}/index.html`;
      
      const arahanFolder = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: folderKeyFallback,
      });
      const responFolder = await r2Client.send(arahanFolder);
      kodIsiAsli = await streamKeTeks(responFolder.Body);
      
      // Paksa ekstensi dilaraskan sebagai html untuk ketetapan header kandungan
      ekstensiFail = 'html';
    }
    // =====================================================================
    // Tamat: Enjin Imbasan & Directory Index Fallback
    // =====================================================================

    // Tentukan jenis Content-Type secara dinamik mengikut keperluan pelayar warga siber
    const contentTypeTerpilih = PEMETAAN_MIME[ekstensiFail] || 'text/plain; charset=utf-8';

    // Pulangkan maklum balas respons tulen (Pure Web Content) terus ke dalam iframe sandbox
    return new Response(kodIsiAsli, {
      status: 200,
      headers: {
        "Content-Type": contentTypeTerpilih,
        "X-Content-Type-Options": "nosniff", // Melindungi daripada cubaan menggodam jenis MIME
      },
    });

  } catch (error) {
    // Jika semua cubaan fallback gagal ditemui di baldi R2, pulangkan status ralat 404 murni
    return new Response("❌ Fail atau direktori teratak tidak ditemui dalam storan R2.", { 
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}