import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js"; // ➔ TAMBAHAN: Import Supabase Client

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

// Mula: Inisialisasi Hubungan Supabase Pelayan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Tamat: Inisialisasi Hubungan Supabase Pelayan

// Mula: Kamus Pemetaan MIME untuk Menyokong Kandungan Murni Web
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
  'woff2': 'font/woff2',
  'keep': 'text/plain' 
};
// Tamat: Kamus Pemetaan MIME

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
    .min(0, { message: "Kandungan fail tidak boleh kosong abangku! ⚠️" })
    .refine((val) => Buffer.byteLength(val, 'utf8') <= 51200, {
      message: "❌ Fail ditolak! Saiz fail anda terlalu besar (Maksimum 50KB sahaja)."
    }),
  pathFailBaru: z.string().optional()
}).refine((data) => {
  const laluanMesej = data.pathFailBaru || "index.html";
  const ekstensi = laluanMesej.split('.').pop().toLowerCase();
  return Object.keys(PEMETAAN_MIME).includes(ekstensi);
}, {
  message: "❌ Jenis fail disekat! Sila gunakan jenis fail statik siber yang sah sahaja.",
  path: ["pathFailBaru"]
});

// =====================================================================
// ➔ Mula: Pembuangan Benteng Sekatan XSS Lama (Kelonggaran Kreativiti Warga)
// Penapis anti-script lama telah dibuang dari bahagian schema ini demi 
// membolehkan komuniti menulis JavaScript murni di dalam sandboxed iframe.
// ➔ Tamat: Pembuangan Benteng Sekatan XSS Lama
// =====================================================================

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
    const pathSpesifik = searchParams.get("path") || "index.html";

    const semakInput = dapatkanWargaSchema.safeParse({ username });
    if (!semakInput.success) {
      return NextResponse.json(
        { success: false, message: semakInput.error.issues[0]?.message || "Ralat input dikesan." }, 
        { status: 400 }
      );
    }

    const namaFail = `${username.toLowerCase()}/${pathSpesifik.replace(/^\/+/, '')}`;
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
      message: "Fail belum wujud atau kosong." 
    }, { status: 404 });
  }
}

export async function POST(request) {
  try {
    const dataBadan = await request.json();
    const semakData = muatNaikTeratakSchema.safeParse(dataBadan);
    
    if (!semakData.success) {
      return NextResponse.json(
        { success: false, message: semakData.error.issues[0]?.message || "Ralat pengesahan fail." }, 
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

    // =====================================================================
    // Mula: SURGICAL INJECTION - Kirim Denyutan Aktiviti ke Supabase
    // =====================================================================
    try {
      const adakahFolder = kodHtml === "FOLDER_PLACEHOLDER";
      let statusAksi = "menyunting fail retro statik";
      
      if (adakahFolder) {
        statusAksi = "memacak direktori folder baharu";
      } else if (subLaluanFail === "index.html") {
        statusAksi = "mengemaskini reka bentuk wajah utama teratak";
      }

      await supabase.from("aktiviti_warga").insert({
        username: namaPengguna.toLowerCase(),
        aksi: statusAksi,
        nama_fail: subLaluanFail
      });
    } catch (errLog) {
      console.error("Gagal merekod suapan log aktiviti:", errLog);
    }
    // =====================================================================
    // Tamat: SURGICAL INJECTION - Kirim Denyutan Aktiviti ke Supabase

    return NextResponse.json({
      success: true,
      message: `Fail [${subLaluanFail}] berjaya dikunci masuk ke Cloudflare R2! 🛰️`,
      lokasiFail: namaFailFull,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}