import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

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

// =====================================================================
// Mula: Fungsi GET untuk Membaca Fail & Folder R2
// =====================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ success: false, message: "Username diperlukan!" }, { status: 400 });
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: `${username.toLowerCase()}/`,
    });

    const responR2 = await r2Client.send(command);
    const objekMentah = responR2.Contents || [];
    const VFS = [];
    const folderDitemui = new Set();

    objekMentah.forEach((obj) => {
      const laluanRelatif = obj.Key.substring(username.toLowerCase().length + 1);
      if (!laluanRelatif || laluanRelatif === ".keep") return;
      
      const segmen = laluanRelatif.split("/");

      let jalurSemasa = "";
      for (let i = 0; i < segmen.length - 1; i++) {
        if (jalurSemasa) jalurSemasa += "/";
        jalurSemasa += segmen[i];
        if (!folderDitemui.has(jalurSemasa)) {
          folderDitemui.add(jalurSemasa);
          VFS.push({
            nama: segmen[i],
            jenis: "folder",
            laluanFull: jalurSemasa,
          });
        }
      }

      if (segmen[segmen.length - 1] === ".keep") return;

      VFS.push({
        nama: segmen[segmen.length - 1],
        jenis: "fail",
        laluanFull: laluanRelatif,
      });
    });

    return NextResponse.json({ success: true, senaraiFail: VFS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 
// Tamat: Fungsi GET untuk Membaca Fail & Folder R2

// =====================================================================
// Mula: Fungsi DELETE untuk Pemadaman Melata R2 & Log Supabase
// =====================================================================
export async function DELETE(request) {
  try {
    const { username, pathFail } = await request.json();
    const targetKunci = `${username.toLowerCase()}/${pathFail}`;

    const cariCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: targetKunci,
    });

    const senaraiCarian = await r2Client.send(cariCommand);
    const objekUntukDipadam = senaraiCarian.Contents || [];

    if (objekUntukDipadam.length > 0) {
      for (const item of objekUntukDipadam) {
        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: item.Key,
        }));
      }
    } else {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: targetKunci,
      }));
    }

    // Mula: Log Aktiviti Pemadaman Warga ke Supabase
    try {
      await supabase.from("aktiviti_warga").insert({
        username: username.toLowerCase(),
        aksi: "memadam dan membuang item fail kekal",
        nama_fail: pathFail
      });
    } catch (errDelLog) {
      console.error("Gagal merekod suapan log pemadaman:", errDelLog);
    }
    // Tamat: Log Aktiviti Pemadaman Warga ke Supabase

    return NextResponse.json({ success: true, message: "Item berjaya dipadam secara kekal dari R2!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// Tamat: Fungsi DELETE untuk Pemadaman Melata R2 & Log Supabase