import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod"; 

// 1. Inisialisasi Hubungan R2 (Kekal menggunakan kunci .env.local asal abang)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Kamus Pemetaan Mime-Type (Content-Type) untuk pemancaran fail yang tepat di browser
const PEMETAAN_MIME = {
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'json': 'application/json',
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'txt': 'text/plain',
  'text': 'text/plain',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'ttf': 'font/ttf',
  'woff': 'font/woff',
  'woff2': 'font/woff2'
};

// ==========================================
// 🛡️ PENETAPAN SKEMA ZOD (VALIDATION SCHEMAS)
// ==========================================

const dapatkanWargaSchema = z.object({
  username: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(1, { message: "Nama pengguna tidak boleh kosong abangku! ⚠️" })
});

// Skema POST yang dinaik taraf untuk menyokong fail & laluan sub-folder dinamik
const muatNaikTeratakSchema = z.object({
  namaPengguna: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(3, { message: "Nama teratak mestilah sekurang-kurangnya 3 aksara abangku! ⚠️" })
    .max(15, { message: "Nama teratak tidak boleh melebihi 15 aksara abangku! ⚠️" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Nama teratak hanya boleh mengandungi huruf dan nombor sahaja! ⚠️" }),
  
  kodHtml: z.string({ required_error: "Kandungan fail diperlukan abangku! ⚠️" })
    .min(1, { message: "Kandungan fail tidak boleh kosong abangku! ⚠️" })
    // Had saiz fail maksima diperketatkan ke 50KB (51200 Bytes) demi kuota storan
    .refine((val) => Buffer.byteLength(val, 'utf8') <= 51200, {
      message: "⚠️ Fail ditolak! Saiz fail anda terlalu besar (Maksimum 50KB sahaja)."
    }),

  pathFailBaru: z.string().optional() // Parameter laluan fail dari Virtual File System
}).refine((data) => {
  // Sahkan jenis ekstensi fail yang dihantar masuk
  const laluanMesej = data.pathFailBaru || "index.html";
  const ekstensi = laluanMesej.split('.').pop().toLowerCase();
  return Object.keys(PEMETAAN_MIME).includes(ekstensi);
}, {
  message: "❌ Jenis fail disekat! Sistem mengesan cubaan memuat naik jenis fail berisiko tinggi.",
  path: ["pathFailBaru"]
}).refine((data) => {
  // Saringan Penapis XSS: Hanya imbas jika fail tersebut adalah berjenis HTML / HTM
  const laluanMesej = data.pathFailBaru || "index.html";
  const ekstensi = laluanMesej.split('.').pop().toLowerCase();
  
  if (ekstensi === 'html' || ekstensi === 'htm') {
    const corakBahaya = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/gi;
    return !corakBahaya.test(data.kodHtml);
  }
  return true;
}, {
  message: "❌ Amaran Keamanan! Sistem mengesan ada suntikan kod larangan berbahaya di dalam fail HTML anda.",
  path: ["kodHtml"]
});

async function tukarStreamKeTeks(stream) {
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

    const semakInput = dapatkanWargaSchema.safeParse({ username });
    if (!semakInput.success) {
      return NextResponse.json(
        { success: false, message: semakInput.error.errors[0].message }, 
        { status: 400 }
      );
    }

    const namaFail = `${username.toLowerCase()}/index.html`;

    const arahanAmbil = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFail,
    });

    const responR2 = await r2Client.send(arahanAmbil);
    const kodHtmlAsli = await tukarStreamKeTeks(responR2.Body);

    return NextResponse.json({ 
      success: true, 
      kodHtml: kodHtmlAsli 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Fail belum wujud dalam direktori." 
    }, { status: 404 });
  }
}

export async function POST(request) {
  try {
    const dataBadan = await request.json();

    // Jalankan tapisan saringan ketat Zod Sandbox
    const semakData = muatNaikTeratakSchema.safeParse(dataBadan);
    if (!semakData.success) {
      return NextResponse.json(
        { success: false, message: semakData.error.errors[0].message }, 
        { status: 400 }
      );
    }

    const { namaPengguna, kodHtml, pathFailBaru } = semakData.data;
    
    // ➔ REKAAN SENI BINA DINAMIK: Tentukan nama fail berdasarkan laluan yang dihantar pengguna
    // Jika tiada path (legacy fallback), automatik simpan sebagai index.html
    const subLaluanFail = pathFailBaru ? pathFailBaru.replace(/^\/+/, '') : "index.html";
    const namaFailFull = `${namaPengguna.toLowerCase()}/${subLaluanFail}`;

    // Ekstrak ekstensi untuk set Content-Type R2 secara dinamik
    const ekstensiFail = subLaluanFail.split('.').pop().toLowerCase();
    const contentTypeTerpilih = PEMETAAN_MIME[ekstensiFail] || 'text/plain';

    const arahanUpload = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFailFull,
      Body: kodHtml,
      ContentType: contentTypeTerpilih,
    });

    await r2Client.send(arahanUpload);

    return NextResponse.json({
      success: true,
      message: `Fail [${subLaluanFail}] berjaya dikunci masuk ke Cloudflare R2! 🎉`,
      lokasiFail: namaFailFull,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}