import { useState } from 'react';

function PanierModal({ panier, dateDebut, dateFin, onUpdateQuantite, onRemove, onValidate, onClose }) {
  const [loading, setLoading] = useState(false);

  // Formater proprement les dates pour l'affichage
  const formatDateLocale = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleValidationClick = async () => {
    setLoading(true);
    await onValidate();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-[#00E5FF]/40 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2F2F2F]">
          <div>
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] m-0">
              VOTRE PANIER DE RÉSERVATION
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Vérifiez vos articles et la période d'emprunt avant de valider.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Rappel des dates sélectionnées */}
        <div className="bg-black border border-[#2F2F2F] rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs uppercase font-bold">Début de l'emprunt :</span>
            <span className="text-[#00E5FF] font-semibold">{formatDateLocale(dateDebut)}</span>
          </div>
          <div className="hidden sm:block border-r border-[#2F2F2F]"></div>
          <div>
            <span className="text-gray-500 block text-xs uppercase font-bold">Fin de l'emprunt :</span>
            <span className="text-[#00E5FF] font-semibold">{formatDateLocale(dateFin)}</span>
          </div>
        </div>

        {/* Liste des articles du panier */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2F2F2F] pr-1 mb-6">
          {panier.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Votre panier est actuellement vide.
            </div>
          ) : (
            panier.map((item) => (
              <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base">{item.nom}</h4>
                  <span className="text-gray-400 text-xs">Stock dispo sur cette période : {item.quantiteDisponible}</span>
                </div>

                {/* Gestion de la quantité dans le panier */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-black border border-[#2F2F2F] rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-400">Qté :</span>
                    <input 
                      type="number" 
                      min="1"
                      max={item.quantiteDisponible}
                      value={item.quantite}
                      onChange={(e) => onUpdateQuantite(item._id, parseInt(e.target.value) || 1)}
                      className="w-12 bg-transparent text-center text-white text-sm focus:outline-none"
                    />
                  </div>

                  <button 
                    onClick={() => onRemove(item._id)}
                    className="text-xs bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30 px-3 py-2 rounded-lg hover:bg-[#FF003C]/20 transition-colors cursor-pointer"
                  >
                    SUPPRIMER
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Boutons d'action bas de modale */}
        {panier.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2F2F2F]">
            <span className="text-sm text-gray-400">
              Total articles : <strong className="text-white">{panier.reduce((acc, item) => acc + item.quantite, 0)}</strong>
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2F2F2F] text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-colors cursor-pointer text-sm"
              >
                CONTINUER MES ACHATS
              </button>
              <button 
                onClick={handleValidationClick}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#00E5FF] text-black font-bold rounded-xl hover:bg-[#00E5FF]/90 transition-colors cursor-pointer text-sm shadow-lg"
              >
                {loading ? "VALIDATION..." : "VALIDER LA RÉSERVATION"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PanierModal;