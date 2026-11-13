function ProductCard({ produit }) {
  return (
    <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-xl p-6 flex flex-col justify-between shadow-lg hover:border-[#00E5FF]/40 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-white tracking-wide">{produit.nom}</h3>
          <span className={`text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap ${
            produit.disponibilite 
              ? 'bg-[#00E5FF]/10 text-[#00E5FF]' 
              : 'bg-[#FF003C]/10 text-[#FF003C]'
          }`}>
            {produit.disponibilite ? 'DISPONIBLE' : 'INDISPONIBLE'}
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{produit.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-[#2F2F2F] pt-4 text-sm">
        <span className="text-gray-400">Stock : <strong className="text-white">{produit.quantiteTotale}</strong></span>
      </div>
    </div>
  );
}

export default ProductCard;