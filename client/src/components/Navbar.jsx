function Navbar({ totalArticlesPanier, onOpenCart, onNavigateProfile, onLogout }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-[#2F2F2F] gap-4">
      <div>
        <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-widest text-[#00E5FF] m-0">
          CAMPUS_MATÉRIEL
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-1">
          Sélectionnez votre période d'emprunt et composez votre panier
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
        {/* Bouton Profil */}
        <button 
          onClick={onNavigateProfile}
          className="px-4 py-2 bg-[#2F2F2F] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          MON PROFIL
        </button>

        {/* Bouton Panier avec compteur */}
        <button 
          onClick={onOpenCart}
          className="px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 hover:bg-[#00E5FF]/20"
        >
          PANIER 
          {totalArticlesPanier > 0 && (
            <span className="bg-[#00E5FF] text-black text-xs px-2 py-0.5 rounded-full font-extrabold">
              {totalArticlesPanier}
            </span>
          )}
        </button>

        {/* Bouton Déconnexion */}
        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-[#2F2F2F] hover:bg-[#FF003C]/20 hover:text-[#FF003C] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          DÉCONNEXION
        </button>
      </div>
    </header>
  );
}

export default Navbar;