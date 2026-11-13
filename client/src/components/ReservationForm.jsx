import { useState } from 'react';

function ReservationForm({ produit, onCancel, onSuccess }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtenir la date/heure actuelle au format requis pour "min" (YYYY-MM-DDTHH:mm)
  const now = new Date();
  const currentDateTime = now.toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          dateDebut: new Date(dateDebut).toISOString(),
          dateFin: new Date(dateFin).toISOString(),
          produits: [
            {
              _id: produit._id,
              nom: produit.nom,
              quantite: Number(quantite)
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }

      onSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
        
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2F2F2F]">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] m-0">
            RÉSERVER : {produit.nom}
          </h2>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Date de début :
              </label>
              <input 
                type="datetime-local" 
                value={dateDebut} 
                min={currentDateTime} // Empêche de choisir une date passée
                onChange={(e) => {
                  setDateDebut(e.target.value);
                  // Si la date de fin est antérieure à la nouvelle date de début, on la réinitialise
                  if (dateFin && dateFin < e.target.value) {
                    setDateFin('');
                  }
                }} 
                className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark]"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Date de fin :
              </label>
              <input 
                type="datetime-local" 
                value={dateFin} 
                min={dateDebut || currentDateTime} // La fin ne peut pas être avant le début
                onChange={(e) => setDateFin(e.target.value)} 
                className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark]"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Quantité (Max: {produit.quantiteTotale}) :
            </label>
            <input 
              type="number" 
              min="1" 
              max={produit.quantiteTotale} 
              value={quantite} 
              onChange={(e) => setQuantite(e.target.value)} 
              className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
              required 
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-dashed border-[#2F2F2F] mt-6">
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#2F2F2F] text-gray-300 font-bold hover:bg-white/5 transition-colors cursor-pointer"
            >
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#00E5FF] text-black font-bold hover:bg-[#00E5FF]/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'VALIDATION...' : 'VALIDER LA RÉSERVATION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationForm;