import { createClient } from '@supabase/supabase-js';

// 1. Hubungkan kod ke pintu Supabase menggunakan kunci rahsia tadi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Home() {
  
  // 2. Tarik (fetch) data secara live dari table 'projek_data'
  const { data: projek_data, error } = await supabase
    .from('projek_data')
    .select('*');

  // 3. Ambil baris data pertama. Jika tiada, letak mesej amaran.
  const mesejDinamik = projek_data && projek_data[0] 
    ? projek_data[0].mesej 
    : "Alamak abangku, data gagal ditarik atau table kosong! 😢";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
      <div className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl max-w-md mx-4">
        
        {/* Tajuk Utama */}
        <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight animate-bounce">
          Status Web Dinamik 🚀
        </h1>
        
        {/* Mesej yang ditarik dari Database Supabase */}
        <p className="mt-6 text-xl font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl">
          "{mesejDinamik}"
        </p>
        
        <div className="mt-6 text-sm text-slate-500 border-t border-slate-800 pt-4">
          Data ditarik secara: <span className="text-orange-400 font-semibold">LIVE (Dinamik)</span> <br/>
          dari table <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 text-xs">projek_data</code>
        </div>

      </div>
    </div>
  );
}