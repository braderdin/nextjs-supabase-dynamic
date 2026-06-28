import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// 1. Inisialisasi Hubungan ke Cloudflare R2 menggunakan kunci rahsia .env.local
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    // 2. Ambil data nama pengguna dan kod HTML yang dihantar dari frontend nanti
    const { namaPengguna, kodHtml } = await request.json();

    if (!namaPengguna || !kodHtml) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap abangku!" },
        { status: 400 }
      );
    }

    // 3. Tetapkan nama fail & lokasi di dalam bucket R2 (Contoh: alif/index.html)
    const namaFail = `${namaPengguna.toLowerCase()}/index.html`;

    // 4. Sediakan arahan muat naik fail
    const arahanUpload = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: namaFail,
      Body: kodHtml,
      ContentType: "text/html", // Bagitahu browser ini adalah fail laman web HTML
    });

    // 5. Jalankan proses hantar ke Cloudflare R2
    await r2Client.send(arahanUpload);

    return NextResponse.json({
      success: true,
      message: `Laman web untuk ${namaPengguna} berjaya disimpan di Cloudflare R2!`,
      lokasiFail: namaFail,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}