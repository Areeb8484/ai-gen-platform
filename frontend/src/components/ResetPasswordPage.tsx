import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
import SupportWidget from './SupportWidget';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setValidatingToken(false);
        return;
      }

      try {
        const response = await authAPI.verifyResetToken(token);
        setTokenValid(true);
        setUserEmail(response.data.email);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Invalid or expired reset token. Please request a new password reset.');
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password successfully reset. You can now log in with your new password.' }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Too short', color: 'text-red-400' };
    if (password.length < 8) return { strength: 'Weak', color: 'text-yellow-400' };
    if (password.length < 12) return { strength: 'Good', color: 'text-cyan-400' };
    return { strength: 'Strong', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white">Validating reset link...</h2>
          <p className="text-gray-300 mt-2">Please wait while we verify your reset token.</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
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
        
        {/* Error message */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
            
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
              {error}
            </div>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200 text-center"
              >
                Request New Reset Link
              </Link>
              
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

  if (success) {
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
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h2>
            
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </div>
            
            <p className="text-gray-300 mb-6">
              You can now log in with your new password.
            </p>
            
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-6 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200"
            >
              Go to Login
            </Link>
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
      
      {/* Reset password form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
            <p className="text-gray-300">
              Enter a new password for <span className="text-cyan-400 font-mono">{userEmail}</span>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter new password"
                required
              />
              {password && (
                <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                  Strength: {passwordStrength.strength}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
              )}
            </div>
            
            <div className="mb-6 text-sm text-gray-400">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li className={password.length >= 6 ? 'text-green-400' : ''}>
                  At least 6 characters
                </li>
                <li className={password === confirmPassword && password ? 'text-green-400' : ''}>
                  Passwords must match
                </li>
              </ul>
            </div>
            
            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
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

export default ResetPasswordPage;