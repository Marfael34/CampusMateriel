import { useState, useEffect } from 'react';

function Profile({ user, onBackToCatalog }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Impossible de récupérer vos réservations.");
        const data = await res.json();
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

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

  const enAttente = reservations.filter(r => r.statut === 'en_attente');
  const enCoursOuValidee = reservations.filter(r => r.statut === 'validee' || r.statut === 'en_cours');
  const terminees = reservations.filter(r => ['terminee', 'annulee', 'refusee'].includes(r.statut));

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'en_attente':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">EN ATTENTE</span>;
      case 'validee':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">VALIDÉE</span>;
      case 'en_cours':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">EN COURS</span>;
      case 'terminee':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">TERMINÉE</span>;
      case 'annulee':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30">ANNULÉE</span>;
      case 'refusee':
        return <span className="px-3 py-1 rounded text-xs font-bold bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30">REFUSÉE</span>;
      default:
        return <span className="px-3 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-400">{statut}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] p-4 sm:p-8 lg:p-12">
      {/* En-tête du Profil */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-[#2F2F2F] gap-4">
        <div>
          <h1 className="font-['Bebas_Neue']  text-4xl sm:text-5xl tracking-widest text-[#00E5FF] m-0">
            MON PROFIL & RÉSERVATIONS
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Gérez vos informations personnelles et suivez vos emprunts de matériel
          </p>
        </div>
        <button 
          onClick={onBackToCatalog}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#00E5FF] text-black font-bold rounded-xl hover:bg-[#00E5FF]/90 transition-colors cursor-pointer text-sm shadow-lg"
        >
          RETOUR AU CATALOGUE
        </button>
      </div>

      {/* CARTE INFORMATIONS PERSONNELLES */}
      <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-xl p-6 mb-8 shadow-xl">
        <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#00E5FF] mb-4">
          INFORMATIONS DU COMPTE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-black p-4 rounded-lg border border-[#2F2F2F]">
            <span className="text-gray-400 block text-xs uppercase font-bold mb-1">Nom</span>
            <span className="text-white font-medium text-base">{user?.nom || 'Non renseigné'}</span>
          </div>
          <div className="bg-black p-4 rounded-lg border border-[#2F2F2F]">
            <span className="text-gray-400 block text-xs uppercase font-bold mb-1">Prénom</span>
            <span className="text-white font-medium text-base">{user?.prenom || 'Non renseigné'}</span>
          </div>
          <div className="bg-black p-4 rounded-lg border border-[#2F2F2F]">
            <span className="text-gray-400 block text-xs uppercase font-bold mb-1">Adresse Email</span>
            <span className="text-white font-medium text-base">{user?.email || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
            CHARGEMENT DE VOS RÉSERVATIONS...
          </h2>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* SECTION 1 : EN ATTENTE */}
          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-yellow-400 mb-4">
              Réservations en attente ({enAttente.length})
            </h2>
            {enAttente.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19] border border-[#2F2F2F] p-4 rounded-xl">Aucune réservation en attente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enAttente.map(resa => (
                  <ReservationCard key={resa._id} resa={resa} getStatusBadge={getStatusBadge} formatDateLocale={formatDateLocale} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2 : EN COURS / VALIDÉES */}
          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#00E5FF] mb-4">
              Réservations en cours / validées ({enCoursOuValidee.length})
            </h2>
            {enCoursOuValidee.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19] border border-[#2F2F2F] p-4 rounded-xl">Aucune réservation active pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enCoursOuValidee.map(resa => (
                  <ReservationCard key={resa._id} resa={resa} getStatusBadge={getStatusBadge} formatDateLocale={formatDateLocale} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 3 : TERMINÉES / HISTORIQUE */}
          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-gray-400 mb-4">
              Historique (Terminées / Annulées) ({terminees.length})
            </h2>
            {terminees.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19] border border-[#2F2F2F] p-4 rounded-xl">Aucun historique disponible.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terminees.map(resa => (
                  <ReservationCard key={resa._id} resa={resa} getStatusBadge={getStatusBadge} formatDateLocale={formatDateLocale} />
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}

function ReservationCard({ resa, getStatusBadge, formatDateLocale }) {
  return (
    <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-gray-500">RÉSA #{resa._id}</span>
          {getStatusBadge(resa.statut)}
        </div>

        <div className="text-xs text-gray-400 mb-4 bg-black p-3 rounded-lg border border-[#2F2F2F] space-y-1">
          <div><strong className="text-gray-300">Du :</strong> {formatDateLocale(resa.dateDebut)}</div>
          <div><strong className="text-gray-300">Au :</strong> {formatDateLocale(resa.dateFin)}</div>
        </div>

        <div className="space-y-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Matériel emprunté :</span>
          <ul className="divide-y divide-[#2F2F2F]">
            {resa.produits.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between text-sm">
                <span className="text-white font-medium">{item.nom}</span>
                <span className="bg-[#2F2F2F] text-gray-300 px-2 py-0.5 rounded text-xs font-bold">Qté : {item.quantite}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile;