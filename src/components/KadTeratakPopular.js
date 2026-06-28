import Link from 'next/link';

export default function KadTeratakPopular() {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 shadow-[4px_4px_0px_0px_#eab308] flex flex-col">
      <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b-2 border-slate-800 font-mono text-[11px] text-slate-300 select-none">
        <span className="flex items-center gap-1.5">⭐ teratak_popular.log</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-700"></span>
          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
        </div>
      </div>
      <div className="p-4 flex-1 font-mono text-xs space-y-3">
        <Link href="/laman/testabangku" className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 hover:border-yellow-500 transition-colors group">
          <span className="text-slate-200 group-hover:text-yellow-400 underline">1. /laman/testabangku</span>
          <span className="text-emerald-400 text-[10px]">🔥 432 Pelawat</span>
        </Link>
        <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 text-slate-500">
          <span>2. /laman/braderdin</span>
          <span className="text-[10px]">🔥 310 Pelawat</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 text-slate-500">
          <span>3. /laman/mat_kapcai</span>
          <span className="text-[10px]">🔥 198 Pelawat</span>
        </div>
      </div>
    </div>
  );
}