import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod"; // ➔ Suntikan Zod untuk pengawal siber ketat

// 1. Inisialisasi Hubungan R2 (Kekal menggunakan kunci .env.local asal abang)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// ==========================================
// 🛡️ PENETAPAN SKEMA ZOD (VALIDATION SCHEMAS)
// ==========================================

// Skema tapisan untuk data GET
const dapatkanWargaSchema = z.object({
  username: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(1, { message: "Nama pengguna tidak boleh kosong abangku! ⚠️" })
});

// Skema tapisan untuk data POST (Muat naik teratak peribadi)
const muatNaikTeratakSchema = z.object({
  namaPengguna: z.string({ required_error: "Nama pengguna diperlukan abangku! ⚠️" })
    .min(3, { message: "Nama teratak mestilah sekurang-kurangnya 3 aksara abangku! ⚠️" })
    .max(15, { message: "Nama teratak tidak boleh melebihi 15 aksara abangku! ⚠️" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Nama teratak hanya boleh mengandungi huruf dan nombor sahaja! ⚠️" }),
  
  kodHtml: z.string({ required_error: "Kod HTML diperlukan abangku! ⚠️" })
    .min(1, { message: "Kod HTML tidak boleh kosong abangku! ⚠️" })
    // Tapisan 1: Sekatan saiz fail maksima 50KB (51200 Bytes)
    .refine((val) => Buffer.byteLength(val, 'utf8') <= 51200, {
      message: "⚠️ Teratak ditolak! Saiz kod HTML anda terlalu besar (Maksimum 50KB sahaja)."
    })
    // Tapisan 2: Sekatan XSS / Kod perosak berbahaya
    .refine((val) => {
      const corakBahaya = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/gi;
      return !corakBahaya.test(val);
    }, {
      message: "❌ Amaran! Sistem mengesan ada kod larangan atau skrip berbahaya di dalam HTML anda."
    })
});

// Fungsi pembantu untuk menukar penstriman data R2 (Stream) menjadi teks HTML biasa
async function tukarStreamKeTeks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// ➔ FUNGSI GET: Mengambil kod HTML sedia ada dari R2 untuk fungsi Edit Semula
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // Lakukan validasi input menggunakan Zod
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

// ➔ FUNGSI POST: Menyimpan / mengemaskini fail ke R2 berserta tapisan keselamatan siber keras
export async function POST(request) {
  try {
    const dataBadan = await request.json();

    // Lakukan validasi struktur data penuh menggunakan Zod
    const semakData = muatNaikTeratakSchema.safeParse(dataBadan);
    if (!semakData.success) {
      return NextResponse.json(
        { success: false, message: semakData.error.errors[0].message }, 
        { status: 400 }
      );
    }

    // Jika lepas saringan Zod, ambil data yang bersih
    const { namaPengguna, kodHtml } = semakData.data;
    const namaFail = `${namaPengguna.toLowerCase()}/index.html`;

    // C. Sediakan arahan muat naik fail menggunakan baldi R2 asal abang
    const arahanUpload = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFail,
      Body: kodHtml,
      ContentType: "text/html",
    });

    // D. Jalankan proses hantar ke Cloudflare R2
    await r2Client.send(arahanUpload);

    return NextResponse.json({
      success: true,
      message: `Laman web untuk ${namaPengguna} berjaya disimpan di Cloudflare R2! 🎉`,
      lokasiFail: namaFail,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}