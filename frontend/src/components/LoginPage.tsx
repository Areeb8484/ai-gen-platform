import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SupportWidget from './SupportWidget';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex flex-col">
      {/* Header with clickable logo */}
      <header className="p-6">
        <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer w-fit">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 shadow-lg bg-slate-700 p-2 flex items-center justify-center">
            <img src="/ai-gen-logo.png" alt="AI Gen Platform Logo" className="w-8 h-8 rounded-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white leading-none">AI Gen Platform</h1>
        </a>
      </header>
      
      {/* Login form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Login</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition duration-200 shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </div>
      
      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

export default LoginPage;
