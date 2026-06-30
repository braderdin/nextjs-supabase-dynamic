import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
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

// 📥 GET: Membaca seluruh isi kandungan objek R2 milik username dan menukarnya ke format VFS Grid
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
      // Potong prefix nama folder induk pengguna secara selamat ( mixed-case safe )
      const laluanRelatif = obj.Key.substring(username.toLowerCase().length + 1);
      if (!laluanRelatif || laluanRelatif === ".keep") return;
      
      const segmen = laluanRelatif.split("/");

      // Logik Rekursif: Wujudkan entiti folder secara automatik berdasarkan susunan sub-path prefix
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

      // Pastikan fail placeholder .keep milik folder kosong tidak tersenarai sebagai fail visual
      if (segmen[segmen.length - 1] === ".keep") return;

      // ➔ ✅ PEMBAIKAN JITU: Menggunakan laluanRelatif yang betul untuk mengelakkan ralat ReferenceError / Crash 500
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

// ❌ DELETE: Menguruskan pemadaman fail tunggal atau pemadaman melata (cascading folder delete)
export async function DELETE(request) {
  try {
    const { username, pathFail } = await request.json();
    const targetKunci = `${username.toLowerCase()}/${pathFail}`;

    // Cari semua sub-objek di bawah prefix tersebut (Menyokong pemadaman folder beserta isinya)
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
      // Fallback untuk pemadaman fail tunggal jika ListObjects kosong
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: targetKunci,
      }));
    }

    // =====================================================================
    // Mula: SURGICAL INJECTION - Kirim Denyutan Pemadaman Fail ke Supabase
    // =====================================================================
    try {
      await supabase.from("aktiviti_warga").insert({
        username: username.toLowerCase(),
        aksi: "memadam dan membuang item fail kekal",
        nama_fail: pathFail
      });
    } catch (errDelLog) {
      console.error("Gagal merekod suapan log pemadaman:", errDelLog);
    }
    // =====================================================================
    // Tamat: SURGICAL INJECTION - Kirim Denyutan Pemadaman Fail ke Supabase

    return NextResponse.json({ success: true, message: "Item berjaya dipadam secara kekal dari R2!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}