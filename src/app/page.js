export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
      <div className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl max-w-md mx-4本">
        
        {/* Tajuk Utama */}
        <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight">
          Hai Abangku! 🚀
        </h1>
        
        {/* Penerangan */}
        <p className="mt-4 text-lg text-slate-300">
          Ini projek web dinamik pertama saya menggunakan Next.js + Supabase.
        </p>
        
        {/* Nota kaki untuk semakan folder */}
        <div className="mt-6 text-sm text-slate-500 border-t border-slate-800 pt-4">
          Berjaya diedit di: <br/>
          <code className="bg-slate-950 px-2 py-1 rounded text-emerald-400 text-xs inline-block mt-1">
            src/app/page.js
          </code>
        </div>

      </div>
    </div>
  );
}
