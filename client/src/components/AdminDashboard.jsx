import { useState, useEffect } from 'react';
import logo from '../assets/logo.jpg';

function AdminDashboard({ user, onBackToCatalog }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAllReservations = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Accès non autorisé ou erreur serveur.");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const handleUpdateStatus = async (id, nouveauStatut) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reservations/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du statut.");
      
      setSuccessMessage(`Réservation #${id} mise à jour avec succès.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchAllReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDateLocale = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const estEnRetard = (resa) => {
    if (!['validee', 'en_cours'].includes(resa.statut)) return false;
    return new Date() > new Date(resa.dateFin);
  };

  const enAttente = reservations.filter(r => r.statut === 'en_attente');
  const enRetardList = reservations.filter(r => estEnRetard(r));
  const actives = reservations.filter(r => ['validee', 'en_cours'].includes(r.statut) && !estEnRetard(r));
  const archivees = reservations.filter(r => ['terminee', 'refusee', 'annulee'].includes(r.statut));

  return (
    <div className="space-y-8 font-inter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <span className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Mode Administrateur
          </span>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white mt-2 mb-0">
            DASHBOARD GESTION MATÉRIEL
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-inter">
            Validation des commandes, suivi des emprunteurs et contrôle des retards
          </p>
        </div>

        <button 
          onClick={onBackToCatalog}
          className="self-start sm:self-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-bold transition-all cursor-pointer text-xs tracking-wider font-inter shadow-lg"
        >
          RETOUR AU CATALOGUE
        </button>
      </div>

      {successMessage && (
        <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-xl font-semibold text-sm backdrop-blur-md font-inter">
          ✨ {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl font-semibold text-sm backdrop-blur-md font-inter">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
            CHARGEMENT DES COMMANDES...
          </h2>
        </div>
      ) : (
        <div className="space-y-12">
          {enRetardList.length > 0 && (
            <section>
              <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#FF003C] mb-4 flex items-center gap-3">
                🚨 Matériel en retard de restitution <span className="bg-[#FF003C]/20 text-[#FF003C] text-xs px-2.5 py-0.5 rounded-full font-mono">{enRetardList.length}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enRetardList.map((resa, index) => (
                  <AdminReservationCard 
                    key={resa._id ? resa._id.toString() : index} 
                    resa={resa} 
                    enRetard={true}
                    formatDateLocale={formatDateLocale} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-amber-400 mb-4 flex items-center gap-3">
              Commandes en attente de validation <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono">{enAttente.length}</span>
            </h2>
            {enAttente.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl">Aucune commande en attente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enAttente.map((resa, index) => (
                  <AdminReservationCard 
                    key={resa._id ? resa._id.toString() : index} 
                    resa={resa} 
                    formatDateLocale={formatDateLocale} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#00E5FF] mb-4 flex items-center gap-3">
              Emprunts en cours / validés <span className="bg-[#00E5FF]/20 text-[#00E5FF] text-xs px-2.5 py-0.5 rounded-full font-mono">{actives.length}</span>
            </h2>
            {actives.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl">Aucun emprunt actif actuellement.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {actives.map((resa, index) => (
                  <AdminReservationCard 
                    key={resa._id ? resa._id.toString() : index} 
                    resa={resa} 
                    formatDateLocale={formatDateLocale} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-gray-400 mb-4 flex items-center gap-3">
              Historique global des commandes <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-mono">{archivees.length}</span>
            </h2>
            {archivees.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl">Aucun historique disponible.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {archivees.map((resa, index) => (
                  <AdminReservationCard 
                    key={resa._id ? resa._id.toString() : index} 
                    resa={resa} 
                    formatDateLocale={formatDateLocale} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function AdminReservationCard({ resa, enRetard, formatDateLocale, onUpdateStatus }) {
  // Sécurise l'ID de la réservation (qu'il soit dans _id ou id)
  const resaId = resa._id || resa.id;

  return (
    <div className={`bg-gradient-to-b from-[#0B0F19] to-black border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 font-inter ${
      enRetard ? 'border-[#FF003C]/60 shadow-[0_0_20px_rgba(255,0,60,0.15)]' : 'border-white/10 hover:border-[#00E5FF]/30'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-gray-400 tracking-wider">COMMANDE #{resaId}</span>
          {enRetard ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/40 tracking-wider font-inter animate-pulse">
              EN RETARD
            </span>
          ) : (
            <span className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wider font-inter ${
              resa.statut === 'en_attente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
              resa.statut === 'validee' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' :
              resa.statut === 'en_cours' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              'bg-gray-500/10 text-gray-400 border border-gray-500/30'
            }`}>
              {resa.statut.toUpperCase()}
            </span>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4 text-xs space-y-1">
          <span className="text-gray-400 uppercase font-bold tracking-wider block mb-1">Étudiant / Emprunteur :</span>
          <div className="text-white font-semibold text-sm">
            {resa.user?.prenom} {resa.user?.nom}
          </div>
          <div className="text-gray-400 font-mono">{resa.user?.email}</div>
        </div>

        <div className="text-xs text-gray-300 mb-4 bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
          <div className="flex justify-between"><span className="text-gray-500 font-medium">Début :</span> <span className="font-mono text-white">{formatDateLocale(resa.dateDebut)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 font-medium">Fin :</span> <span className="font-mono text-white">{formatDateLocale(resa.dateFin)}</span></div>
        </div>

        <div className="space-y-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Matériel demandé :</span>
          <ul className="divide-y divide-white/5">
            {resa.produits.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between text-sm">
                <span className="text-gray-200 font-medium">{item.nom}</span>
                <span className="bg-white/5 text-cyan-300 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border border-white/5">x{item.quantite}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
        {resa.statut === 'en_attente' && (
          <>
            <button 
              onClick={() => onUpdateStatus(resaId, 'validee')}
              className="flex-1 py-2 px-3 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)] font-inter"
            >
              VALIDER
            </button>
            <button 
              onClick={() => onUpdateStatus(resaId, 'refusee')}
              className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-[#FF003C] border border-red-500/30 font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer font-inter"
            >
              REFUSER
            </button>
          </>
        )}

        {['validee', 'en_cours'].includes(resa.statut) && (
          <button 
            onClick={() => onUpdateStatus(resaId, 'terminee')}
            className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer font-inter"
          >
            MARQUER COMME RENDU / TERMINÉ
          </button>
        )}

        {['terminee', 'refusee', 'annulee'].includes(resa.statut) && (
          <span className="text-xs text-gray-500 italic w-full text-center py-1">Commande traitée</span>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;