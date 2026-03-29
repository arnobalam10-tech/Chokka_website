import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const API_URL = 'https://chokka-server.onrender.com';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        navigate('/admin');
      } else {
        setError('ACCESS DENIED: Wrong Password');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chokka-dark flex items-center justify-center p-4">
      <div className="bg-chokka-cream p-8 rounded-lg max-w-sm w-full border-4 border-chokka-green shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
        <div className="flex justify-center mb-6">
          <div className="bg-chokka-dark p-4 rounded-full border-2 border-white">
            <Lock className="text-chokka-green" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-widest text-chokka-dark">
          Restricted Area
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter Secret Code"
            className="p-3 border-2 border-chokka-dark font-bold text-center focus:outline-none focus:border-chokka-green"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && (
            <p className="text-red-600 font-bold text-center text-sm">{error}</p>
          )}
          <button
            disabled={loading}
            className="bg-chokka-green text-chokka-dark font-bold py-3 hover:bg-white transition-colors border-2 border-transparent hover:border-chokka-dark disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'UNLOCK SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
}
