export default function ButangGoogleLogin({ user, handleLogin, handleLogout }) {
  // 1. Jika pengguna SUDAH LOG MASUK, paparkan profile Gmail mereka
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 font-mono text-xs shadow-inner">
        <img 
          src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/pixel-art/svg"} 
          alt="Avatar Warga" 
          className="w-7 h-7 border border-pink-500 object-cover"
        />
        <div className="text-left hidden sm:block">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Warga Aktif:</span>
          <span className="text-pink-400 font-bold block truncate max-w-[120px]">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-2 py-1 text-[10px] uppercase font-mono font-bold transition-colors"
        >
          [ Keluar ]
        </button>
      </div>
    );
  }

  // 2. Jika pengguna BELUM LOG MASUK, paparkan butang Log Masuk Google
  return (
    <button 
      onClick={handleLogin}
      className="bg-slate-950 border-2 border-pink-500 hover:bg-pink-500 hover:text-slate-950 text-pink-400 font-mono font-black px-4 py-2.5 text-xs uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(236,72,153,0.4)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
    >
      🔑 DAFTAR / LOG MASUK GENG
    </button>
  );
}