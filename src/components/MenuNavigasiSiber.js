import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MenuNavigasiSiber() {
  const pathname = usePathname();

  // ➔ SUNTIKAN KUNCI BARU: Ditambah laluan ke Pondok Siber & Surat Layang
  const senaraiMenu = [
    { nama: "🏠 Teraju Utama", pautan: "/" },
    { nama: "🌐 Jelajah Kampung", pautan: "/jelajah" },
    { nama: "📜 Kitab HTML", pautan: "/kitab" },
    { nama: "🎨 Kitab Grafik", pautan: "/kitab_grafik" },
    { nama: "⛺ Pondok Siber", pautan: "/pondok" },      // Pintu masuk BBS Forum
    { nama: "📨 Surat Layang", pautan: "/surat-layang" }, // Pintu masuk Realtime DM
  ];

  return (
    <nav className="w-full bg-slate-900 border-2 border-slate-800 p-2 shadow-[4px_4px_0px_0px_#ec4899]">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 font-mono text-xs">
        <div className="bg-slate-950 px-3 py-1.5 text-pink-400 font-bold border border-slate-800 text-center md:text-left select-none">
          🧭 MENU_UTAMA.SYS :
        </div>
        
        {/* Susunan grid-cols-2 automatik membahagi 6 butang dengan seimbang pada skrin telefon */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap flex-1 gap-2">
          {senaraiMenu.map((menu, indeks) => {
            const adakahAktif = pathname === menu.pautan;
            
            return (
              <Link 
                key={indeks}
                href={menu.pautan}
                className={`text-center bg-slate-950 border px-2 sm:px-4 py-2 font-medium transition-all active:scale-[0.98] text-[11px] sm:text-xs truncate ${
                  adakahAktif 
                    ? "text-pink-500 border-pink-500 bg-pink-950/20 font-bold shadow-[inner_0px_0px_8px_rgba(236,72,153,0.2)]" 
                    : "text-slate-300 border-slate-800 hover:border-pink-500/50 hover:text-pink-400"
                }`}
              >
                {menu.nama}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}