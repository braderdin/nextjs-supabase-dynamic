import { createClient } from "@supabase/supabase-js";
import Link from 'next/link';  

// ➔ PENYELESAIAN ABADI: Guna Absolute Import (@/) untuk elak pening mengira anak tangga folder!
import KomponenKomenDanKaunter from "@/components/KomponenKomenDanKaunter"; 
import WidgetJiranIntim from "@/components/WidgetJiranIntim"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function LamanWargaSiber({ params }) {
  const resolvedParams = await params;
  const namaPengguna = resolvedParams.namaPengguna;
  const jaluan = resolvedParams.jaluan;

  // Menyusun semula laluan fail secara dinamik
  const subPathFail = jaluan && jaluan.length > 0 ? jaluan.join('/') : 'index.html';

  let senaraiJiranIntim = [];
  let profilWujud = false;

  try {
    // =====================================================================
    // Mula: Semakan Profil Warga & Jiran Intim via Supabase
    // =====================================================================
    const { data: profil } = await supabase
      .from('warga_profil')
      .select('id')
      .eq('username', namaPengguna.toLowerCase())
      .maybeSingle();

    if (profil) {
      profilWujud = true; // Mengesahkan bahawa teratak warga ini memang wujud dalam database
      const { data: jiranData } = await supabase
        .from('jiran_intim')
        .select('jiran_username, slot_kedudukan')
        .eq('user_id', profil.id)
        .order('slot_kedudukan', { ascending: true });
                  
      if (jiranData) {
        senaraiJiranIntim = jiranData;
      }
    }
    // =====================================================================
    // Tamat: Semakan Profil Warga & Jiran Intim via Supabase
    // =====================================================================

    // Jika nama teratak tiada langsung dalam rekod pangkalan data kampung
    if (!profilWujud) {
      throw new Error("Profil ghaib");
    }

    // Memastikan bar kaunter pelawat dan top 8 jiran muncul jika berada di index utama teratak
    const adakahLamanUtama = subPathFail === 'index.html' || subPathFail === '';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        
        {/* ===================================================================== */}
        {/* Mula: Paparan Iframe Sandboxed Anti-XSS Selamat (Bebas Kreatif JS)    */}
        {/* ===================================================================== */}
        <div className={adakahLamanUtama ? "w-full h-[75vh] min-h-[550px] border-b-2 border-slate-900 bg-slate-950" : "w-full h-screen overflow-hidden bg-slate-950"}>
          <iframe 
            src={`/api/raw-serve?username=${namaPengguna}&path=${subPathFail}`}
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-forms allow-popups"
          />
        </div>
        {/* ===================================================================== */}
        {/* Tamat: Paparan Iframe Sandboxed Anti-XSS Selamat (Bebas Kreatif JS)   */}
        {/* ===================================================================== */}
        
        {adakahLamanUtama && (
          <>
            <div className="max-w-xl w-full mx-auto px-4 mt-8">
              <WidgetJiranIntim senaraiJiran={senaraiJiranIntim} />
            </div>
            <KomponenKomenDanKaunter namaPengguna={namaPengguna} />
          </>
        )}
      </div>
    );
  } catch (error) {
    // Paparan Ralat 404 Jika Teratak atau Folder Gagal Ditemui
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center font-mono text-xs p-6 text-center">
        <div className="bg-slate-900 border-2 border-red-500 p-6 max-w-md shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-red-400 font-bold text-sm mb-2">⚠️ FAIL / TERATAK TIDAK DIJUMPAI</p>
          <p className="mb-4 leading-relaxed">
            Maaf abangku, fail <span className="text-pink-400 font-bold">"{subPathFail}"</span> tiada dalam arkib teratak <span className="text-yellow-400 font-bold">@{namaPengguna}</span>.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 px-4 py-2 font-bold transition-all text-[11px]"
          >
            BALIK KE TERAJU UTAMA
          </Link>
        </div>
      </div>
    );
  }
}