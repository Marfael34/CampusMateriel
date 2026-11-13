import { useState } from 'react';

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Stockage du token et transmission de l'utilisateur au parent
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-[#0B0F19] border border-[#2F2F2F] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="font-['Bebas_Neue'] text-4xl tracking-widest text-[#00E5FF] mb-2">
            CAMPUS_MATÉRIEL
          </h1>
          <p className="text-gray-400 text-sm">Connectez-vous pour accéder au catalogue</p>
        </div>

        {error && (
          <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] p-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Email institutionnel :
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
              placeholder="ex: etudiant@campus.fr"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Mot de passe :
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-black border border-[#2F2F2F] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 rounded-lg bg-[#00E5FF] text-black font-bold hover:bg-[#00E5FF]/90 transition-colors cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;