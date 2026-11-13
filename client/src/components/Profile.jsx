import { useState, useEffect } from 'react';
import logo from '../assets/logo.jpg';

function Profile({ user }) {
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
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-wider font-inter">EN ATTENTE</span>;
      case 'validee':
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 tracking-wider shadow-[0_0_10px_rgba(0,229,255,0.15)] font-inter">VALIDÉE</span>;
      case 'en_cours':
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)] font-inter">EN COURS</span>;
      case 'terminee':
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30 tracking-wider font-inter">TERMINÉE</span>;
      case 'annulee':
      case 'refusee':
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30 tracking-wider font-inter">REFUSÉE / ANNULÉE</span>;
      default:
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-500/10 text-gray-400 font-inter">{statut}</span>;
    }
  };

  return (
    <div className="space-y-8 font-inter">
      <div className="pb-6 border-b border-white/10">
        <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white m-0">
          ESPACE PERSONNEL
        </h1>
        <p className="text-gray-400 text-sm mt-0.5 font-inter">
          Suivi de vos réservations et informations de compte
        </p>
      </div>

      <div className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#00E5FF] mb-4">
          IDENTIFICATION DU COMPTE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-inter">
          <div className="bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Nom</span>
            <span className="text-white font-semibold text-base">{user?.nom || 'Non renseigné'}</span>
          </div>
          <div className="bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Prénom</span>
            <span className="text-white font-semibold text-base">{user?.prenom || 'Non renseigné'}</span>
          </div>
          <div className="bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Adresse Email</span>
            <span className="text-white font-semibold text-base">{user?.email || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl font-semibold font-inter">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
            CHARGEMENT DE VOS DONNÉES...
          </h2>
        </div>
      ) : (
        <div className="space-y-12 font-inter">
          
          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-amber-400 mb-4 flex items-center gap-3">
              Réservations en attente <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono">{enAttente.length}</span>
            </h2>
            {enAttente.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl font-inter">Aucune réservation en attente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enAttente.map(resa => (
                  <ReservationCard key={resa._id} resa={resa} getStatusBadge={getStatusBadge} formatDateLocale={formatDateLocale} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-[#00E5FF] mb-4 flex items-center gap-3">
              Réservations en cours / validées <span className="bg-[#00E5FF]/20 text-[#00E5FF] text-xs px-2.5 py-0.5 rounded-full font-mono">{enCoursOuValidee.length}</span>
            </h2>
            {enCoursOuValidee.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl font-inter">Aucune réservation active pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enCoursOuValidee.map(resa => (
                  <ReservationCard key={resa._id} resa={resa} getStatusBadge={getStatusBadge} formatDateLocale={formatDateLocale} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-gray-400 mb-4 flex items-center gap-3">
              Historique des emprunts <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-mono">{terminees.length}</span>
            </h2>
            {terminees.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-[#0B0F19]/50 border border-white/5 p-4 rounded-xl font-inter">Aucun historique disponible.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/10 hover:border-[#00E5FF]/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 font-inter">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-gray-400 tracking-wider">RÉSERVATION #{resa._id}</span>
          {getStatusBadge(resa.statut)}
        </div>

        <div className="text-xs text-gray-300 mb-5 bg-black/60 p-4 rounded-xl border border-white/5 space-y-1.5 font-inter">
          <div className="flex justify-between"><span className="text-gray-500 font-medium">Début :</span> <span className="font-mono text-white">{formatDateLocale(resa.dateDebut)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 font-medium">Fin :</span> <span className="font-mono text-white">{formatDateLocale(resa.dateFin)}</span></div>
        </div>

        <div className="space-y-2 font-inter">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Matériel emprunté :</span>
          <ul className="divide-y divide-white/5">
            {resa.produits.map((item, idx) => (
              <li key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-gray-200 font-medium">{item.nom}</span>
                <span className="bg-white/5 text-cyan-300 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border border-white/5">x{item.quantite}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile;