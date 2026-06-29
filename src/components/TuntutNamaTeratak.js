export default function TuntutNamaTeratak({ 
  usernameInput, 
  setUsernameInput, 
  handleCiptaProfil, 
  loadingProfil, 
  errorProfil 
}) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#eab308] max-w-md mx-auto animate-fadeIn">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 font-mono text-xs text-slate-200 select-none">
        <span>📁 tuntut_nama_teratak.exe</span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
        </div>
      </div>
      
      <div className="p-6 font-mono">
        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-tight mb-2">
          ✨ Selamat Datang Warga Siber Baharu!
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
          Sila pilih satu nama teratak unik siber anda. Nama ini akan menjadi alamat URL kekal bagi profil digital anda (Contoh: /laman/nama-anda).
        </p>

        <form onSubmit={handleCiptaProfil} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nama Teratak Anda (Tiada jarak & huruf kecil sahaja)
            </label>
            <input 
              type="text"
              required
              maxLength={15}
              placeholder="Contoh: matcoding, sibergirl"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-none px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-700"
            />
          </div>

          <button 
            type="submit"
            disabled={loadingProfil}
            className="w-full bg-slate-950 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-yellow-500 font-black py-2.5 px-4 text-xs tracking-widest uppercase transition-all disabled:opacity-40"
          >
            {loadingProfil ? "💾 SEDANG MENYEMAK..." : "🚀 REBUT NAMA TERATAK INI"}
          </button>
        </form>

        {errorProfil && (
          <div className="mt-3 text-[10px] text-red-400 bg-red-950/20 border border-red-900/50 p-2 text-center">
            ⚠️ {errorProfil}
          </div>
        )}
      </div>
    </div>
  );
}