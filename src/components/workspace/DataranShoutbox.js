"use client";

export default function DataranShoutbox({
  shoutNama,
  setShoutNama,
  shoutMesej,
  setShoutMesej,
  loadingShout,
  senaraiShout,
  handleHantarShout
}) {
  return (
    // Mula: Kontena Master Dataran Shoutbox UI 2026 Minimalis Linear Vibe
    <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-0 font-mono text-xs mt-4 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] transition-all">
      
      {/* Mula: Header Bar Terminal Minimalis */}
      <div className="bg-slate-900/40 px-4 py-2 flex items-center justify-between border-b border-slate-900/80 text-slate-300 select-none">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight text-slate-200">dataran_shoutbox_global.sys</span>
        </span>
        <span className="text-[9px] text-blue-400 font-semibold tracking-widest uppercase">
          📡 FREKUENSI_LIVE_REALTIME
        </span>
      </div>
      {/* Tamat: Header Bar Terminal Minimalis */}

      {/* Mula: Reka Bentuk Grid 2026 (Responsive Bento) */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Mula: Sub-Bento Kiri (Borang Input Jeritan) */}
        <form onSubmit={handleHantarShout} className="space-y-3 bg-slate-950/60 p-4 border border-slate-900/60 flex flex-col justify-between">
          <span className="text-[10px] text-blue-400 font-bold block uppercase tracking-wider select-none">
            📢 LAUNGKAN MESEJ ANDA
          </span>
          
          <div className="space-y-2 flex-1 pt-2">
            <input 
              type="text" 
              maxLength={12}
              placeholder="Nama / Samaran (A-Z)" 
              value={shoutNama} 
              onChange={(e) => setShoutNama(e.target.value)} 
              required
              className="w-full bg-slate-900/40 border border-slate-900/80 p-2 text-yellow-400 focus:outline-none focus:border-slate-800 focus:bg-slate-950 placeholder:text-slate-700 font-mono transition-colors rounded-none"
            />
            <textarea 
              maxLength={100}
              rows={3}
              placeholder="Tinggalkan jejak, sapaan, atau url teratak abangku..." 
              value={shoutMesej} 
              onChange={(e) => setShoutMesej(e.target.value)} 
              required
              className="w-full bg-slate-900/40 border border-slate-900/80 p-2 text-slate-200 focus:outline-none focus:border-slate-800 focus:bg-slate-950 placeholder:text-slate-700 resize-none text-[11px] font-mono transition-colors rounded-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loadingShout}
            className="w-full bg-slate-900 hover:bg-blue-950/40 text-blue-400 hover:text-blue-300 font-bold py-2 uppercase border border-slate-900 hover:border-blue-900/60 tracking-wider text-[10px] transition-all rounded-none active:scale-[0.99] disabled:opacity-40"
          >
            {loadingShout ? "SEDANG MENJERIT..." : "⚡ LAUNGKAN SEKARANG"}
          </button>
        </form>
        {/* Tamat: Sub-Bento Kiri (Borang Input Jeritan) */}

        {/* Mula: Sub-Bento Kanan (Paparan Terminal Sembang Realtime) */}
        <div className="md:col-span-2 bg-slate-950/20 border border-slate-900/60 p-3 h-[210px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent space-y-2 text-[11px]">
          {senaraiShout.length === 0 ? (
            <div className="text-center text-slate-600 font-mono py-16 select-none">
              [ Dataran sunyi murni... Jadilah warga pertama yang menegur! ]
            </div>
          ) : (
            senaraiShout.map((shout) => (
              <div key={shout.id} className="border-b border-slate-900/40 pb-2 last:border-0 leading-relaxed break-all font-mono">
                <span className="text-blue-400 font-bold">[{shout.nama}]</span>
                <span className="text-slate-400 pl-1.5 font-sans">{shout.mesej}</span>
                <span className="text-[8px] text-slate-600 block text-right font-mono mt-0.5 select-none">
                  {new Date(shout.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
        {/* Tamat: Sub-Bento Kanan (Paparan Terminal Sembang Realtime) */}

      </div>
      {/* Tamat: Reka Bentuk Grid 2026 (Responsive Bento) */}

    </div>
    // Tamat: Kontena Master Dataran Shoutbox UI 2026 Minimalis Linear Vibe
  );
}