function ProductCard({ produit, onSelect }) {
  // On utilise quantiteDisponible renvoyée par le backend (avec fallback sur quantiteTotale si non défini)
  const stockAffiche = produit.quantiteDisponible !== undefined ? produit.quantiteDisponible : produit.quantiteTotale;
  const estDisponible = stockAffiche > 0;

  return (
    <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-xl p-6 flex flex-col justify-between shadow-xl transition-all hover:border-[#00E5FF]/50">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-['Bebas_Neue'] text-2xl sm:text-3xl tracking-wider text-white m-0">
            {produit.nom}
          </h3>
          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            estDisponible 
              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
              : 'bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30'
          }`}>
            {estDisponible ? 'DISPONIBLE' : 'INDISPONIBLE'}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          {produit.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#2F2F2F]">
        <div className="text-sm">
          <span className="text-gray-400">Stock dispo : </span>
          <span className="text-white font-bold text-base">{stockAffiche} / {produit.quantiteTotale}</span>
        </div>

        <button 
          onClick={() => onSelect(produit)}
          disabled={!estDisponible}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
            estDisponible 
              ? 'bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90' 
              : 'bg-[#2F2F2F] text-gray-500 cursor-not-allowed'
          }`}
        >
          RÉSERVER
        </button>
      </div>
    </div>
  );
}

export default ProductCard;