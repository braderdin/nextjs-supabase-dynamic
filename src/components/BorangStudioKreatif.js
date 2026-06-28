import Link from 'next/link';

export default function BorangStudioKreatif({
  namaPengguna,
  setNamaPengguna,
  kodHtml,
  setKodHtml,
  handleSimpanKeR2,
  loading,
  statusR2,
  lamanBerjaya
}) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#10b981]">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
        <span className="flex items-center gap-2">📝 studio_kreatif_notepad.sys</span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-xs text-slate-400 mb-6 font-mono">
          [SILA TAIP KOD DI SINI]: Cipta nama folder dan masukkan struktur HTML/CSS abang di bawah untuk disimpan ke Cloudflare R2 Storan.
        </p>

        <form onSubmit={handleSimpanKeR2} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              📁 NAMA TERATAK (Akan jadi url laman digital anda)
            </label>
            <input 
              type="text"
              placeholder="Contoh: braderdin, testabangku"
              value={namaPengguna}
              onChange={(e) => setNamaPengguna(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              💾 KOD SUMBER HTML / STYLE CSS
            </label>
            <textarea 
              rows={9}
              value={kodHtml}
              onChange={(e) => setKodHtml(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-none p-4 font-mono text-xs text-yellow-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-mono font-black py-3.5 px-4 text-xs tracking-widest uppercase transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
          >
            {loading ? "💾 SEDANG MEMPROSES FAIL..." : "🚀 PUNTAK MASUK KE CLOUDFLARE R2"}
          </button>
        </form>

        {statusR2 && (
          <div className="mt-5 text-xs font-mono p-4 bg-slate-950 border-2 border-dashed border-slate-800 text-slate-400 text-center flex flex-col items-center justify-center gap-2">
            <span>[SISTEM LOG]: {statusR2}</span>
            {lamanBerjaya && (
              <Link 
                href={`/laman/${lamanBerjaya}`} 
                target="_blank"
                className="mt-1 text-xs font-bold text-pink-400 hover:text-pink-300 underline bg-pink-500/10 px-3 py-1 border border-pink-500/20"
              >
                👉 Klik Sini Untuk Melawat Teratak Siber Anda!
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}