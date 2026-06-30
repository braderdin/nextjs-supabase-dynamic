import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================================
// Mula: Fungsi GET untuk Mengambil Log Aktiviti (Had 5 Item)
// =====================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    
    const limit = 5; 
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("aktiviti_warga")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,aksi.ilike.%${search}%,nama_fail.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data, total: count, limit, page });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 
// Tamat: Fungsi GET untuk Mengambil Log Aktiviti (Had 5 Item)

// =====================================================================
// Mula: Fungsi PATCH untuk Interaksi Likes & Komen JSONB
// =====================================================================
export async function PATCH(request) {
  try {
    const { id, tipe, pengirim, teks } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "ID diperlukan!" }, { status: 400 });

    if (tipe === "like") {
      const { data: item } = await supabase.from("aktiviti_warga").select("likes").eq("id", id).maybeSingle();
      const { error } = await supabase.from("aktiviti_warga").update({ likes: (item?.likes || 0) + 1 }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (tipe === "comment") {
      const { data: item } = await supabase.from("aktiviti_warga").select("komen").eq("id", id).maybeSingle();
      const senaraiKomen = Array.isArray(item?.komen) ? item.komen : [];
      const senaraiKomenBaru = [...senaraiKomen, { pengirim, teks, created_at: new Date().toISOString() }];
      
      const { error } = await supabase.from("aktiviti_warga").update({ komen: senaraiKomenBaru }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, komen: senaraiKomenBaru });
    }

    return NextResponse.json({ success: false, message: "Tipe operasi tidak sah!" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// Tamat: Fungsi PATCH untuk Interaksi Likes & Komen JSONB