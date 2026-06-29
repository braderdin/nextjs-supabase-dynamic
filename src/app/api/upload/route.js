import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// 1. Inisialisasi Hubungan R2 (Kekal menggunakan kunci .env.local asal abang)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
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

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Nama pengguna diperlukan abangku! ⚠️" }, 
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
    // Jika fail belum pernah dicipta, pulangkan status bersih supaya frontend tahu fail belum wujud
    return NextResponse.json({ 
      success: false, 
      message: "Fail belum wujud dalam direktori." 
    }, { status: 404 });
  }
}

// ➔ FUNGSI POST: Menyimpan / mengemaskini fail ke R2 berserta tapisan keselamatan siber keras
export async function POST(request) {
  try {
    const { namaPengguna, kodHtml } = await request.json();

    if (!namaPengguna || !kodHtml) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap abangku! ⚠️" }, 
        { status: 400 }
      );
    }

    // A. SEKATAN SAIZ FIL: Semak saiz rentetan HTML (Maksimum 50KB = 51200 Bytes)
    const saizKod = Buffer.byteLength(kodHtml, 'utf8');
    if (saizKod > 51200) {
      return NextResponse.json({ 
        success: false, 
        message: "⚠️ Teratak ditolak! Saiz kod HTML anda terlalu besar (Maksimum 50KB sahaja)." 
      }, { status: 400 });
    }

    // B. TAPISAN KOD PEROSAK: Sekat tag <script> atau pemicu fungsi XSS berbahaya
    const corakBahaya = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/gi;
    if (corakBahaya.test(kodHtml)) {
      return NextResponse.json({ 
        success: false, 
        message: "❌ Amaran! Sistem mengesan ada kod larangan atau skrip berbahaya di dalam HTML anda." 
      }, { status: 400 });
    }

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