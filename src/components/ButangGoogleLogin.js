export default function ButangGoogleLogin({ user, handleLogin, handleLogout }) {
  // Mula: Transformasi Sesi Pengguna Gaya Minimalis 2026 (Logged In)
  if (user) {
    return (
      <div className="flex items-center gap-2.5 bg-slate-900/40 backdrop-blur-sm border border-slate-900 p-1.5 px-3 font-mono text-[11px] shadow-sm select-none rounded-none">
        <img 
          src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/pixel-art/svg"} 
          alt="Avatar Warga" 
          className="w-5 h-5 rounded-full border border-slate-800 object-cover"
        />
        <div className="text-left hidden sm:block">
          <span className="text-slate-300 font-semibold block truncate max-w-[120px]">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 bg-transparent px-1 py-0.5 text-[10px] uppercase font-mono font-medium transition-colors ml-1"
        >
          [ Keluar ]
        </button>
      </div>
    );
  }
  // Tamat: Transformasi Sesi Pengguna Gaya Minimalis 2026 (Logged In)

  // Mula: Transformasi Butang Masuk Gaya Vercel Flat 2026 (Logged Out)
  return (
    <button 
      onClick={handleLogin}
      className="bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono font-medium px-3.5 py-1.5 text-[11px] uppercase tracking-wide transition-all select-none active:scale-[0.98] flex items-center gap-1.5 rounded-none"
    >
      🔑 Log Masuk
    </button>
  );
  // Tamat: Transformasi Butang Masuk Gaya Vercel Flat 2026 (Logged Out)
}