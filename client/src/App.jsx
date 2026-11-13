import { useState, useEffect } from 'react';
import Login from './components/Login';
import ProductCard from './components/ProductCard';


function App() {
  const [user, setUser] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Vérification de la session au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionnel : tu pourrais décoder le token ou fetch /api/auth/me
      // Pour l'instant, on charge les produits directement
      fetchProduits();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProduits = () => {
    fetch('http://localhost:5000/api/produits')
      .then((res) => res.json())
      .then((data) => {
        setProduits(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement produits :", err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Si pas connecté, on affiche le formulaire de login en point d'entrée
  if (!localStorage.getItem('token') && !user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Inter']">
        <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
          CHARGEMENT...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] p-4 sm:p-8 lg:p-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-[#2F2F2F] gap-4">
        <div>
          <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-widest text-[#00E5FF] m-0">
            CAMPUS_MATÉRIEL
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Catalogue et réservation de matériel audiovisuel
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 bg-[#2F2F2F] hover:bg-[#FF003C]/20 hover:text-[#FF003C] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          DÉCONNEXION
        </button>
      </header>
    </div>
  );
}

export default App;