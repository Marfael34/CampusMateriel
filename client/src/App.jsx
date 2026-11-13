import { useState, useEffect } from 'react';
import Login from './components/Login';
import ProductCard from './components/ProductCard';
import ReservationForm from './components/ReservationForm';

function App() {
  const [user, setUser] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialisation des dates par défaut (maintenant -> demain)
  const now = new Date();
  const defaultStart = now.toISOString().slice(0, 16);
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultEnd = future.toISOString().slice(0, 16);

  const [dateDebut, setDateDebut] = useState(defaultStart);
  const [dateFin, setDateFin] = useState(defaultEnd);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProduitsDisponibles(token, dateDebut, dateFin);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProduitsDisponibles = async (token, start, end) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/produits/disponibles?dateDebut=${start}&dateFin=${end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur récupération des disponibilités");
      const data = await res.json();
      setProduits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByDate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    fetchProduitsDisponibles(token, dateDebut, dateFin);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProduits([]);
  };

  if (!localStorage.getItem('token') && !user) {
    return (
      <Login 
        onLoginSuccess={(userData) => {
          setUser(userData);
          fetchProduitsDisponibles(localStorage.getItem('token'), dateDebut, dateFin);
        }} 
      />
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
            Sélectionnez votre période d'emprunt pour voir le matériel disponible
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 bg-[#2F2F2F] hover:bg-[#FF003C]/20 hover:text-[#FF003C] text-gray-300 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          DÉCONNEXION
        </button>
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
        <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-xl mb-8 font-semibold shadow-lg">
          ✅ {successMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-[#00E5FF] animate-pulse">
            VÉRIFICATION DES STOCKS...
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produits.map((produit) => (
            <ProductCard 
              key={produit._id} 
              produit={produit} 
              onSelect={(p) => setSelectedProduct({ ...p, prefilledDebut: dateDebut, prefilledFin: dateFin })} 
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ReservationForm 
          produit={selectedProduct} 
          initialDebut={selectedProduct.prefilledDebut}
          initialFin={selectedProduct.prefilledFin}
          onCancel={() => setSelectedProduct(null)} 
          onSuccess={(msg) => {
            setSelectedProduct(null);
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(null), 5000);
            fetchProduitsDisponibles(localStorage.getItem('token'), dateDebut, dateFin);
          }} 
        />
      )}
    </div>
  );
}

export default App;