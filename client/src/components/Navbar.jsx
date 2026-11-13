import { useState } from 'react';
import logo from '../assets/logo.jpg';

function Navbar({ totalArticlesPanier, onOpenCart, onNavigateProfile, onNavigateAdmin, onNavigateCatalogue, onLogout, user, currentView }) {
  return (
    <nav className="bg-[#0B0F19]/80 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white m-0 leading-none">CAMPUS MATÉRIEL</h2>
          <span className="text-xs text-[#00E5FF] font-mono">ESPACE ÉTUDIANT & GESTION</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Bouton Dashboard Admin (si admin) */}
        {user?.role?.includes('admin') && (
          <button 
            onClick={onNavigateAdmin}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer font-inter shadow-lg ${
              currentView === 'admin' 
                ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10'
            }`}
          >
            DASHBOARD
          </button>
        )}

        {/* Bouton Catalogue (affiché entre Dashboard et Profile) */}
        <button 
          onClick={onNavigateCatalogue}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer font-inter shadow-lg ${
            currentView === 'catalogue' 
              ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
              : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10'
          }`}
        >
          CATALOGUE
        </button>

        {/* Bouton Profil (reste fixe, ne se transforme plus en catalogue) */}
        <button 
          onClick={onNavigateProfile}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer font-inter shadow-lg ${
            currentView === 'profile' 
              ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
              : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10'
          }`}
        >
          PROFIL
        </button>

        {/* Bouton Panier */}
        <button 
          onClick={onOpenCart}
          className="relative px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-bold transition-all cursor-pointer text-xs tracking-wider font-inter shadow-lg flex items-center gap-2"
        >
          <span>PANIER</span>
          {totalArticlesPanier > 0 && (
            <span className="bg-[#00E5FF] text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]">
              {totalArticlesPanier}
            </span>
          )}
        </button>

        {/* Bouton Déconnexion */}
        <button 
          onClick={onLogout}
          className="px-4 py-2.5 bg-[#FF003C]/10 hover:bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/30 rounded-xl font-bold transition-all cursor-pointer text-xs tracking-wider font-inter shadow-lg"
        >
          DÉCONNEXION
        </button>
      </div>
    </nav>
  );
}

export default Navbar;