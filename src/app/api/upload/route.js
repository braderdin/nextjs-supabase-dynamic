import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod"; 

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

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

const dapatkanWargaSchema = z.object({
  username: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(1, { message: "Nama pengguna tidak boleh kosong abangku! ⚠️" })
});

const muatNaikTeratakSchema = z.object({
  namaPengguna: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(3, { message: "Nama teratak mestilah sekurang-kurangnya 3 aksara abangku! ⚠️" })
    .max(15, { message: "Nama teratak tidak boleh melebihi 15 aksara abangku! ⚠️" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Nama teratak hanya boleh mengandungi huruf dan nombor sahaja! ⚠️" }),
  
  kodHtml: z.string({ required_error: "Kandungan fail diperlukan abangku! ⚠️" })
    .min(1, { message: "Kandungan fail tidak boleh kosong abangku! ⚠️" })
    .refine((val) => Buffer.byteLength(val, 'utf8') <= 51200, {
      message: "⚠️ Fail ditolak! Saiz fail anda terlalu besar (Maksimum 50KB sahaja)."
    }),

  pathFailBaru: z.string().optional() 
}).refine((data) => {
  const laluanMesej = data.pathFailBaru || "index.html";
  const ekstensi = laluanMesej.split('.').pop().toLowerCase();
  return Object.keys(PEMETAAN_MIME).includes(ekstensi);
}, {
  message: "❌ Jenis fail disekat! Sistem mengesan cubaan memuat naik jenis fail berisiko tinggi.",
  path: ["pathFailBaru"]
}).refine((data) => {
  const laluanMesej = data.pathFailBaru || "index.html";
  const ekstensi = laluanMesej.split('.').pop().toLowerCase();
  
  if (ekstensi === 'html' || ekstensi === 'htm') {
    const corakBahaya = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/gi;
    return !corakBahaya.test(data.kodHtml);
  } // ➔ PEMBAIKAN: Ditambah penutup yang tercicir
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

    const semakData = muatNaikTeratakSchema.safeParse(dataBadan);
    if (!semakData.success) {
      return NextResponse.json(
        { success: false, message: semakData.error.errors[0].message }, 
        { status: 400 }
      );
    }

    const { namaPengguna, kodHtml, pathFailBaru } = semakData.data;
    const subLaluanFail = pathFailBaru ? pathFailBaru.replace(/^\/+/, '') : "index.html";
    const namaFailFull = `${namaPengguna.toLowerCase()}/${subLaluanFail}`;

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