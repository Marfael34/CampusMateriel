import { useState } from 'react';
import logo from '../assets/logo.jpg';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion.");

      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter flex items-center justify-center p-4 relative overflow-hidden">
      {/* Effet lumineux d'arrière-plan */}
      <div className="absolute w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/10 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* En-tête avec Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-emerald-500 rounded-2xl blur opacity-40"></div>
            <img 
              src={logo} 
              alt="Logo Campus Matériel" 
              className="relative w-16 h-16 object-cover rounded-2xl border border-white/20 shadow-lg" 
            />
          </div>
          <h1 className="font-inter text-4xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white m-0">
            CAMPUS_MATÉRIEL
          </h1>
          <p className="text-gray-400 text-xs tracking-wide mt-1">
            Connectez-vous pour accéder au catalogue d'emprunt
          </p>
        </div>

        {error && (
          <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-4 rounded-xl mb-6 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Adresse Email
            </label>
            <input 
              type="email5" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@campus.fr"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Mot de passe
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold rounded-xl text-sm tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.25)] mt-2 disabled:opacity-50"
          >
            {loading ? "CONNEXION EN COURS..." : "SE CONNECTER"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;