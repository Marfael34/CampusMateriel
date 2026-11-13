import { useState } from 'react';
import logo from '../assets/logo.jpg';

function Navbar({ totalArticlesPanier, onOpenCart, onNavigateProfile, onNavigateAdmin, onLogout, user, currentView }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (action) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 mb-8 transition-all font-inter shadow-xl">
      <div className="flex items-center justify-between">
        
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
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase font-inter">
              Plateforme d'emprunt
            </span>
          </div>
        </div>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-3 font-inter">
          {user?.role?.includes('admin') && (
            <button 
              onClick={onNavigateAdmin}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border cursor-pointer font-inter ${
                currentView === 'admin' 
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              Dashboard Admin
            </button>
          )}

          <button 
            onClick={onNavigateProfile}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all border border-white/10 cursor-pointer font-inter"
          >
            {currentView === 'profile' ? 'Catalogue' : 'Profil'}
          </button>

          <button 
            onClick={onOpenCart}
            className="px-3.5 py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.1)] font-inter"
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
            className="px-3.5 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-[#FF003C] border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer font-inter"
          >
            Déconnexion
          </button>
        </div>

        {/* Actions Mobile */}
        <div className="flex md:hidden items-center gap-2 font-inter">
          <button 
            onClick={onOpenCart}
            className="px-3 py-2 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 relative font-inter"
          >
            <span>Panier</span>
            {totalArticlesPanier > 0 && (
              <span className="bg-[#00E5FF] text-black text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {totalArticlesPanier}
              </span>
            )}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl text-sm font-bold transition-all cursor-pointer"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {/* Menu Déroulant Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2.5 animate-fadeIn font-inter">
          {user?.role?.includes('admin') && (
            <button 
              onClick={() => handleNavClick(onNavigateAdmin)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide text-left transition-all border cursor-pointer font-inter ${
                currentView === 'admin' 
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              Dashboard Admin
            </button>
          )}

          <button 
            onClick={() => handleNavClick(onNavigateProfile)}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl text-xs font-semibold tracking-wide text-left border border-white/10 transition-all font-inter"
          >
            {currentView === 'profile' ? 'Retour au Catalogue' : 'Mon Profil'}
          </button>

          <button 
            onClick={() => handleNavClick(onLogout)}
            className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-[#FF003C] rounded-xl text-xs font-semibold tracking-wide text-left border border-red-500/20 transition-all font-inter"
          >
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;