function PanierModal({ panier, dateDebut, dateFin, onUpdateQuantite, onRemove, onValidate, onClose }) {
  const formatDateLocale = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const totalArticles = panier.reduce((acc, item) => acc + item.quantite, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B0F19] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* En-tête de la modale */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="font-inter text-3xl tracking-wider text-[#00E5FF] m-0">
              VOTRE PANIER D'EMPRUNT
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Vérifiez les articles et la période sélectionnée avant validation
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-[#FF003C] border border-white/10 flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Période */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-2xl text-xs space-y-1">
            <div className="text-gray-400 uppercase font-bold tracking-wider mb-2">Période d'emprunt :</div>
            <div className="flex justify-between text-gray-200"><span>Du :</span> <span className="font-mono text-cyan-400">{formatDateLocale(dateDebut)}</span></div>
            <div className="flex justify-between text-gray-200"><span>Au :</span> <span className="font-mono text-cyan-400">{formatDateLocale(dateFin)}</span></div>
          </div>

          {/* Liste des articles */}
          {panier.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              Votre panier est actuellement vide.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Articles sélectionnés ({totalArticles}) :</div>
              <div className="divide-y divide-white/5 border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                {panier.map((item) => (
                  <div key={item._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{item.nom}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-black border border-white/10 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => onUpdateQuantite(item._id, item.quantite - 1)}
                          className="px-2.5 py-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono text-xs font-bold text-white">{item.quantite}</span>
                        <button 
                          onClick={() => onUpdateQuantite(item._id, item.quantite + 1)}
                          className="px-2.5 py-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => onRemove(item._id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#FF003C] border border-red-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page de la modale */}
        {panier.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              Poursuivre mes achats
            </button>
            <button 
              onClick={onValidate}
              className="px-6 py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.25)]"
            >
              VALIDER LA RÉSERVATION
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PanierModal;