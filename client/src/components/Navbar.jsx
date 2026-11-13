import logo from '../assets/logo.jpg';

function Navbar({ totalArticlesPanier, onOpenCart, onNavigateProfile, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 mb-8 flex items-center justify-between transition-all font-inter shadow-xl">
      
      {/* Logo et Titre */}
      <div className="flex items-center gap-3">
        <img 
          src={logo} 
          alt="Logo Campus Matériel" 
          className="w-10 h-10 object-cover rounded-xl border border-white/20 shadow-md shadow-black/50" 
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1">
            CAMPUS <span className="text-[#00E5FF] font-black">MATÉRIEL</span>
          </span>
          <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            Plateforme d'emprunt
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={onNavigateProfile}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all border border-white/10 cursor-pointer"
        >
          Profil
        </button>

        <button 
          onClick={onOpenCart}
          className="px-3.5 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
        >
          <span>Panier</span>
          {totalArticlesPanier > 0 && (
            <span className="bg-[#00E5FF] text-black text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {totalArticlesPanier}
            </span>
          )}
        </button>

        <button 
          onClick={onLogout}
          className="px-3.5 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-[#FF003C] border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
        >
          Quitter
        </button>
      </div>

    </header>
  );
}

export default Navbar;