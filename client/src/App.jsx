import { useState, useEffect } from 'react';
import Login from './components/Login';
import ProductCard from './components/ProductCard';
import PanierModal from './components/PanierModal';

function App() {
  const [user, setUser] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const defaultStart = now.toISOString().slice(0, 16);
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultEnd = future.toISOString().slice(0, 16);

  const [dateDebut, setDateDebut] = useState(defaultStart);
  const [dateFin, setDateFin] = useState(defaultEnd);

  const [panier, setPanier] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Charger les données initiales (panier BDD + produits disponibles) au montage si token présent
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDonneesInitiales(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDonneesInitiales = async (token) => {
    setLoading(true);
    try {
      // 1. Récupérer le panier depuis MongoDB via l'API
      const resPanier = await fetch('http://localhost:5000/api/panier', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPanier.ok) {
        const dataPanier = await resPanier.json();
        setPanier(dataPanier.produits || []);
      }

      // 2. Récupérer les produits disponibles pour la période par défaut
      await fetchProduitsDisponibles(token, dateDebut, dateFin);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la synchronisation des données.");
      setLoading(false);
    }
  };

  const fetchProduitsDisponibles = async (token, start, end) => {
    try {
      const res = await fetch(`http://localhost:5000/api/produits/disponibles?dateDebut=${start}&dateFin=${end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur récupération des disponibilités");
      const data = await res.json();
      setProduits(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la récupération des produits.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour synchroniser le panier avec le backend MongoDB à chaque modification
  const syncPanierBackend = async (nouveauPanier) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('http://localhost:5000/api/panier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          produits: nouveauPanier.map(item => ({ _id: item._id, nom: item.nom, quantite: item.quantite })) 
        })
      });
    } catch (err) {
      console.error("❌ Erreur synchro panier BDD :", err);
    }
  };

  const handleSearchByDate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    fetchProduitsDisponibles(token, dateDebut, dateFin);
  };

  const handleAddToCart = (produit, quantite) => {
    const indexExistant = panier.findIndex(item => item._id === produit._id);
    let nouveauPanier;
    
    if (indexExistant > -1) {
      nouveauPanier = [...panier];
      nouveauPanier[indexExistant].quantite = quantite;
    } else {
      nouveauPanier = [...panier, { 
        _id: produit._id, 
        nom: produit.nom, 
        quantite: quantite,
        quantiteDisponible: produit.quantiteDisponible 
      }];
    }
    
    setPanier(nouveauPanier);
    syncPanierBackend(nouveauPanier); // Enregistrement automatique en BDD
    
    setSuccessMessage(`"${produit.nom}" a été ajouté au panier.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateQuantite = (id, nouvelleQuantite) => {
    const nouveauPanier = panier.map(item => item._id === id ? { ...item, quantite: nouvelleQuantite } : item);
    setPanier(nouveauPanier);
    syncPanierBackend(nouveauPanier);
  };

  const handleRemoveFromPanier = (id) => {
    const nouveauPanier = panier.filter(item => item._id !== id);
    setPanier(nouveauPanier);
    syncPanierBackend(nouveauPanier);
  };

  const handleValiderPanier = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dateDebut,
          dateFin,
          produits: panier.map(item => ({ _id: item._id, nom: item.nom, quantite: item.quantite }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la réservation");

      setSuccessMessage("Réservation du panier enregistrée avec succès ! En attente de validation.");
      
      // Vider le panier en BDD après validation réussie
      await fetch('http://localhost:5000/api/panier', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPanier([]);
      setIsCartOpen(false);
      setErrorMessage(null);
      fetchProduitsDisponibles(token, dateDebut, dateFin);
    } catch (err) {
      setErrorMessage(err.message);
      setIsCartOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProduits([]);
    setPanier([]);
  };

  if (!localStorage.getItem('token') && !user) {
    return (
      <Login 
        onLoginSuccess={(userData) => {
          setUser(userData);
          fetchDonneesInitiales(localStorage.getItem('token'));
        }} 
      />
    );
  }

  const totalArticlesPanier = panier.reduce((acc, item) => acc + item.quantite, 0);

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] p-4 sm:p-8 lg:p-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-[#2F2F2F] gap-4">
        <div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-widest text-[#00E5FF] m-0">
            CAMPUS_MATÉRIEL
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Sélectionnez votre période d'emprunt et composez votre panier
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 hover:bg-[#00E5FF]/20"
          >
            🛒 PANIER 
            {totalArticlesPanier > 0 && (
              <span className="bg-[#00E5FF] text-black text-xs px-2 py-0.5 rounded-full font-extrabold">
                {totalArticlesPanier}
              </span>
            )}
          </button>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-[#2F2F2F] hover:bg-[#FF003C]/20 hover:text-[#FF003C] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
          >
            DÉCONNEXION
          </button>
        </div>
      </header>

      {/* Barre de filtre par dates */}
      <form onSubmit={handleSearchByDate} className="bg-[#0B0F19] border border-[#2F2F2F] rounded-xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-end gap-4 shadow-lg">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Du (Date et heure de début) :
          </label>
          <input 
            type="datetime-local" 
            value={dateDebut} 
            onChange={(e) => setDateDebut(e.target.value)} 
            className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark]"
            required 
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Au (Date et heure de fin) :
          </label>
          <input 
            type="datetime-local" 
            value={dateFin} 
            onChange={(e) => setDateFin(e.target.value)} 
            className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark]"
            required 
          />
        </div>
        <button 
          type="submit" 
          className="w-full md:w-auto px-6 py-2.5 bg-[#00E5FF] text-black font-bold rounded-lg hover:bg-[#00E5FF]/90 transition-colors cursor-pointer whitespace-nowrap"
        >
          VÉRIFIER LES DISPONIBILITÉS
        </button>
      </form>

      {successMessage && (
        <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-xl mb-6 font-semibold shadow-lg">
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl mb-6 font-semibold shadow-lg">
          ❌ {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
            CHARGEMENT DU MATÉRIEL...
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produits.map((produit) => (
            <ProductCard 
              key={produit._id} 
              produit={produit} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Modale du Panier */}
      {isCartOpen && (
        <PanierModal 
          panier={panier}
          dateDebut={dateDebut}
          dateFin={dateFin}
          onUpdateQuantite={handleUpdateQuantite}
          onRemove={handleRemoveFromPanier}
          onValidate={handleValiderPanier}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}

export default App;