import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import SupportWidget from './SupportWidget';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (sent) {
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
        
        {/* Success message */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            </div>
            
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded mb-6">
              {message}
            </div>
            
            <div className="text-gray-300 mb-6">
              <p className="mb-2">We've sent a password reset link to:</p>
              <p className="font-mono text-cyan-400 bg-slate-700/50 px-3 py-2 rounded">{email}</p>
            </div>
            
            <div className="text-sm text-gray-400 mb-6">
              <p>• Check your spam folder if you don't see the email</p>
              <p>• The reset link will expire in 1 hour</p>
              <p>• You can request a new link if needed</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setSent(false)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200 shadow-lg"
              >
                Send Another Email
              </button>
              
              <Link
                to="/login"
                className="block w-full bg-slate-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-slate-600 transition duration-200 text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        
        {/* Support Widget */}
        <SupportWidget />
      </div>
    );
  }

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
      
      {/* Forgot password form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-300">Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your email address"
                required
              />
              {email && !isValidEmail(email) && (
                <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !email || !isValidEmail(email)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Remember your password?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

export default ForgotPasswordPage;