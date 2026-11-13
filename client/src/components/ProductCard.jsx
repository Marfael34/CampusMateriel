import { useState } from 'react';

function ProductCard({ produit, onAddToCart }) {
  const [quantite, setQuantite] = useState(1);

  return (
    <div className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/10 hover:border-[#00E5FF]/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group relative overflow-hidden">
      {/* Effet de lueur subtil au survol */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/5 rounded-full blur-2xl group-hover:bg-[#00E5FF]/10 transition-all duration-500 pointer-events-none"></div>

      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-inter text-2xl tracking-wider text-white group-hover:text-[#00E5FF] transition-colors m-0">
            {produit.nom}
          </h3>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase border ${
            produit.disponibilite 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {produit.disponibilite ? 'DISPONIBLE' : 'INDISPONIBLE'}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
          {produit.description || "Aucune description fournie pour ce matériel."}
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>Stock disponible : <strong className="text-[#00E5FF]">{produit.quantiteDisponible}</strong> / {produit.quantiteTotale}</span>
        </div>

        {produit.disponibilite && (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/80 border border-white/10 rounded-xl overflow-hidden">
              <button 
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold"
              >
                -
              </button>
              <span className="w-10 text-center font-mono text-sm font-bold text-white">{quantite}</span>
              <button 
                onClick={() => setQuantite(Math.min(produit.quantiteDisponible, quantite + 1))}
                className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer font-bold"
              >
                +
              </button>
            </div>

            <button 
              onClick={() => onAddToCart(produit, quantite)}
              className="flex-1 py-2.5 px-4 bg-[#00E5FF]/10 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black border border-[#00E5FF]/30 hover:border-[#00E5FF] rounded-xl text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.1)]"
            >
              AJOUTER AU PANIER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;