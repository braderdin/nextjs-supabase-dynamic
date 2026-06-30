import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Mula: Inisialisasi Hubungan Supabase Pelayan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Tamat: Inisialisasi Hubungan Supabase Pelayan

// 📥 GET: Mengambil senarai log aktiviti dengan sokongan penapisan dan had muka halaman
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    
    // ➔ Hadkan paparan kepada 5 baris aktiviti demi mengekalkan kekemasan skrin abangku
    const limit = 5; 
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("aktiviti_warga")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Mula: Logik Penapisan Kasus Kata Kunci Carian
    if (search) {
      query = query.or(`username.ilike.%${search}%,aksi.ilike.%${search}%,nama_fail.ilike.%${search}%`);
    }
    // Tamat: Logik Penapisan Kasus Kata Kunci Carian

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, total: count, limit, page });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ⚡ PATCH: Mengendalikan logik interaksi suka (likes) & catatan komen JSONB secara real-time
export async function PATCH(request) {
  try {
    const { id, tipe, pengirim, teks } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "ID diperlukan!" }, { status: 400 });

    // Mula: Operasi Logik Pengiraan Likes
    if (tipe === "like") {
      const { data: item } = await supabase.from("aktiviti_warga").select("likes").eq("id", id).maybeSingle();
      const { error } = await supabase.from("aktiviti_warga").update({ likes: (item?.likes || 0) + 1 }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    // Tamat: Operasi Logik Pengiraan Likes

    // Mula: Operasi Suntikan Ulasan ke dalam Array JSONB
    if (tipe === "comment") {
      const { data: item } = await supabase.from("aktiviti_warga").select("komen").eq("id", id).maybeSingle();
      const senaraiKomen = Array.isArray(item?.komen) ? item.komen : [];
      const senaraiKomenBaru = [...senaraiKomen, { pengirim, teks, created_at: new Date().toISOString() }];
      
      const { error } = await supabase.from("aktiviti_warga").update({ komen: senaraiKomenBaru }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, komen: senaraiKomenBaru });
    }
    // Tamat: Operasi Suntikan Ulasan ke dalam Array JSONB

    return NextResponse.json({ success: false, message: "Tipe operasi tidak sah!" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}