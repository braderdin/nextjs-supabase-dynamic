import Link from 'next/link';

export default function WidgetJiranIntim({ senaraiJiran = [] }) {
  // Sediakan susunan 8 slot kosong secara lalai (Default 8 Slots)
  const susunanSlot = Array.from({ length: 8 }, (_, indeks) => {
    const nomborSlot = indeks + 1;
    // Cari jika ada jiran yang telah dikunci pada slot kedudukan ini
    const dataJiran = senaraiJiran.find(j => Number(j.slot_kedudukan) === nomborSlot);
    return dataJiran || { slot_kedudukan: nomborSlot, kosong: true };
  });

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-800 shadow-[6px_6px_0px_0px_#ec4899] font-mono mt-8 select-none">
      {/* KEPALA KOTAK RETRO WIDGET */}
      <div className="bg-slate-850 px-4 py-2 flex items-center justify-between border-b-2 border-slate-800 text-xs text-slate-200">
        <span className="flex items-center gap-1.5">💖 jiran_intim_top8.sys</span>
        <span className="text-[10px] text-pink-400 font-bold tracking-widest uppercase">Ikatan Sahabat</span>
      </div>

      <div className="p-4 md:p-6">
        <h3 className="text-center text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 uppercase tracking-widest mb-6">
          ✨ KELOMPOK JIRAN INTIM TUAN TANAH ✨
        </h3>

        {/* REKAAN GRID TOP 8 RESPONSIVE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {susunanSlot.map((slot, indeks) => {
            if (slot.kosong) {
              return (
                <div 
                  key={indeks}
                  className="bg-slate-950 border border-dashed border-slate-800 p-3 flex flex-col items-center justify-center text-center group opacity-40 hover:opacity-60 transition-opacity"
                >
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 text-lg mb-2">
                    ?
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 tracking-tighter">
                    Slot {slot.slot_kedudukan} Empty
                  </span>
                </div>
              );
            }

            // Jika slot mempunyai jiran tulen
            const namaJiran = slot.jiran_username.toLowerCase();
            return (
              <Link 
                key={indeks}
                href={`/laman/${namaJiran}`}
                className="bg-slate-950 border-2 border-slate-850 hover:border-pink-500 p-3 flex flex-col items-center text-center group transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-[-2px]"
              >
                {/* Gambar Avatar Jiran secara Piksel Dinamik */}
                <div className="w-14 h-14 border-2 border-slate-800 group-hover:border-pink-500 bg-slate-900 p-0.5 overflow-hidden transition-colors">
                  <img 
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${namaJiran}`} 
                    alt={`Avatar ${namaJiran}`}
                    className="w-full h-full object-cover select-none"
                  />
                </div>

                {/* Nama Warga Jiran Intim */}
                <span className="text-[11px] font-bold text-pink-400 group-hover:text-pink-300 truncate w-full mt-2 block">
                  @{namaJiran}
                </span>

                <span className="text-[8px] bg-slate-900 border border-slate-850 text-slate-500 px-1 mt-1 block uppercase">
                  Slot 0{slot.slot_kedudukan}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}