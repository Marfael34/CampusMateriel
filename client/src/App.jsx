import { useState, useEffect } from 'react';
import Login from './components/Login';
import ProductCard from './components/ProductCard';

function App() {
  const [user, setUser] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vérifie si un token est présent au chargement initial
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProduits(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProduits = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/produits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur lors de la récupération des produits");
      const data = await res.json();
      setProduits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProduits([]);
  };

  // Si l'utilisateur n'est pas connecté, on affiche uniquement le Login
  if (!localStorage.getItem('token') && !user) {
    return (
      <Login 
        onLoginSuccess={(userData) => {
          setUser(userData);
          setLoading(true);
          fetchProduits(localStorage.getItem('token'));
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-['Inter']">
        <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
          CHARGEMENT DU CATALOGUE...
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
            Catalogue du matériel audiovisuel disponible
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 bg-[#2F2F2F] hover:bg-[#FF003C]/20 hover:text-[#FF003C] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          DÉCONNEXION
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produits.map((produit) => (
          <ProductCard key={produit._id} produit={produit} />
        ))}
      </div>
    </div>
  );
}

export default App;