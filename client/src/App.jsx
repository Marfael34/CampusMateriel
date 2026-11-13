import { useState, useEffect } from 'react';
import Login from './components/Login';
import ProductCard from './components/ProductCard';
import PanierModal from './components/PanierModal';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('campus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('catalogue'); // 'catalogue', 'profile', 'admin'
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('campus_user');

    if (token) {
      if (!user && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      fetchDonneesInitiales(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDonneesInitiales = async (token) => {
    setLoading(true);
    try {
      const resPanier = await fetch('http://localhost:5000/api/panier', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPanier.ok) {
        const dataPanier = await resPanier.json();
        setPanier(dataPanier.produits || []);
      }

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
      console.error("Erreur synchro panier BDD :", err);
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
    syncPanierBackend(nouveauPanier);
    
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

      setSuccessMessage("Réservation du panier enregistrée avec succès. En attente de validation.");

      setTimeout(() => setSuccessMessage(null), 3000);
      
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
    localStorage.removeItem('campus_user');
    setUser(null);
    setProduits([]);
    setPanier([]);
    setCurrentView('catalogue');
  };

  if (!localStorage.getItem('token') && !user) {
    return (
      <Login 
        onLoginSuccess={(userData) => {
          const userInfo = userData.user || userData;
          setUser(userInfo);
          localStorage.setItem('campus_user', JSON.stringify(userInfo));
          fetchDonneesInitiales(localStorage.getItem('token'));
        }} 
      />
    );
  }

  const totalArticlesPanier = panier.reduce((acc, item) => acc + item.quantite, 0);

  return (
    <div className="min-h-screen bg-black text-white font-inter p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none"></div>

      <Navbar 
        totalArticlesPanier={totalArticlesPanier}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateProfile={() => setCurrentView('profile')}
        onNavigateAdmin={() => setCurrentView('admin')}
        onNavigateCatalogue={() => setCurrentView('catalogue')}
        onLogout={handleLogout}
        user={user}
        currentView={currentView}
      />

      {successMessage && (
        <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-xl mb-6 font-semibold text-sm shadow-lg backdrop-blur-md font-inter">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl mb-6 font-semibold text-sm shadow-lg backdrop-blur-md font-inter">
          {errorMessage}
        </div>
      )}

      {currentView === 'admin' && user?.role?.includes('admin') ? (
        <AdminDashboard user={user} onBackToCatalog={() => setCurrentView('catalogue')} />
      ) : currentView === 'profile' ? (
        <Profile user={user} />
      ) : (
        <>
          <form onSubmit={handleSearchByDate} className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-end gap-6 shadow-2xl backdrop-blur-xl">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-inter">
                Du (Date et heure de début) :
              </label>
              <input 
                type="datetime-local" 
                value={dateDebut} 
                onChange={(e) => setDateDebut(e.target.value)} 
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark] font-inter"
                required 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-inter">
                Au (Date et heure de fin) :
              </label>
              <input 
                type="datetime-local" 
                value={dateFin} 
                onChange={(e) => setDateFin(e.target.value)} 
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors [color-scheme:dark] font-inter"
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full md:w-auto px-6 py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold rounded-xl text-xs tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(0,229,255,0.2)] font-inter"
            >
              VÉRIFIER LES DISPONIBILITÉS
            </button>
          </form>

          {loading ? (
            <div className="text-center py-20">
              <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
                CHARGEMENT DU MATÉRIEL...
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produits.map((produit, index) => (
                <ProductCard 
                  key={produit._id ? produit._id.toString() : index} 
                  produit={produit} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </>
      )}

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