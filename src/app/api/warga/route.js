import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// Inisialisasi Hubungan R2 (Menggunakan kunci .env.local asal abang)
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function GET() {
  try {
    // Gunakan pembatas (Delimiter) '/' untuk membaca struktur nama folder utama sahaja
    const arahanSenarai = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Delimiter: "/", 
    });

    const dataR2 = await r2Client.send(arahanSenarai);
    
    // Ambil nama folder dari CommonPrefixes (Contoh: "braderdin/" -> "braderdin")
    const senaraiFolder = dataR2.CommonPrefixes?.map((item) => {
      return item.Prefix.replace("/", "");
    }) || [];

    return NextResponse.json({ 
      success: true, 
      warga: senaraiFolder 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}