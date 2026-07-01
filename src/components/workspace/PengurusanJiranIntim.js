"use client";

export default function PengurusanJiranIntim({
  senaraiJiranIntim,
  inputSlot,
  setInputSlot,
  handlePadamJiranIntim,
  handleKunciJiranIntim
}) {
  return (
    // Mula: Panel Master Pengurusan Jiran Intim Gaya Vercel Minimalis 2026
    <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/80 p-5 font-mono text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,0.01)] transition-all">
      
      {/* Mula: Header Section Minimalis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/60 pb-3 mb-4 select-none gap-2">
        <div>
          <h3 className="text-white font-bold text-[12px] tracking-tight uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            Neighbourhood Control Panel
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
            Susun, ikat, dan kunci kedudukan rakan tetangga utama ke dalam grid 8 slot teratak anda.
          </p>
        </div>
        <span className="text-[9px] text-slate-600 bg-slate-900/40 border border-slate-900 px-2 py-0.5 rounded-none self-start sm:self-center uppercase tracking-wider">
          v2026.core_v1
        </span>
      </div>
      {/* Tamat: Header Section Minimalis */}

      {/* Mula: Grid Struktur Bento 8-Slot (Responsive Desktop & Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }, (_, i) => {
          const slotNum = i + 1;
          const jiranKunci = senaraiJiranIntim.find(j => Number(j.slot_kedudukan) === slotNum);
          
          return (
            <div 
              key={slotNum} 
              className={`p-3 flex flex-col justify-between gap-3 border transition-all duration-300 ${
                jiranKunci 
                  ? "bg-slate-900/30 border-slate-900 hover:border-pink-500/30 shadow-sm" 
                  : "bg-slate-950/20 border-dashed border-slate-900/80 hover:border-slate-800"
              }`}
            >
              {/* Indikator Slot */}
              <div className="flex items-center justify-between text-[9px] text-slate-600 font-bold uppercase tracking-tight select-none">
                <span>SLOT_0{slotNum}</span>
                {jiranKunci && <span className="w-1 h-1 rounded-full bg-pink-500"></span>}
              </div>

              {jiranKunci ? (
                // Mula: UI Sub-Slot Jika Jiran Wujud
                <div className="flex flex-col gap-2">
                  <span className="text-white font-bold truncate text-[11px] hover:text-pink-400 transition-colors">
                    @{jiranKunci.jiran_username}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handlePadamJiranIntim(jiranKunci.id)} 
                    className="w-full bg-slate-950 hover:bg-red-950/40 border border-slate-900 hover:border-red-900/60 text-slate-500 hover:text-red-400 py-1 rounded-none text-[9px] uppercase font-bold transition-all"
                  >
                    Kosongkan
                  </button>
                </div>
                // Tamat: UI Sub-Slot Jika Jiran Wujud
              ) : (
                // Mula: UI Sub-Slot Jika Kosong / Borang Kunci
                <div className="flex flex-col gap-1.5">
                  <input 
                    type="text" 
                    placeholder="nama jiran" 
                    value={inputSlot[slotNum] || ""} 
                    onChange={(e) => setInputSlot(prev => ({ ...prev, [slotNum]: e.target.value.replace(/[^a-zA-Z0-9]/g, "") }))} 
                    className="w-full bg-slate-950/80 border border-slate-900 text-[11px] p-1.5 px-2 text-white placeholder-slate-700 focus:outline-none focus:border-slate-800 focus:bg-slate-950 transition-colors font-mono rounded-none" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleKunciJiranIntim(slotNum)} 
                    className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white py-1 text-[9px] uppercase font-black transition-all rounded-none"
                  >
                    Kunci Slot
                  </button>
                </div>
                // Tamat: UI Sub-Slot Jika Kosong / Borang Kunci
              )}
            </div>
          );
        })}
      </div>
      {/* Tamat: Grid Struktur Bento 8-Slot */}

    </div>
    // Tamat: Panel Master Pengurusan Jiran Intim Gaya Vercel Minimalis 2026
  );
}