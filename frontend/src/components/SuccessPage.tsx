import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { creditsAPI } from '../api';
import { useAuth } from '../AuthContext';

const SuccessPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        await creditsAPI.verifyPayment(sessionId);
        await updateUser();
        setSuccess(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, updateUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-slate-700 max-w-md w-full text-center">
        {success ? (
          <>
            <a href="/" className="flex items-center justify-center mb-4 space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 shadow-lg bg-slate-700 p-1 flex items-center justify-center">
                <img src="/ai-gen-logo.png" alt="AI Gen Platform Logo" className="w-6 h-6 rounded-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white leading-none">AI Gen Platform</h1>
            </a>
            <div className="text-green-400 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">
              Your credits have been added to your account. You can now submit AI requests.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200 shadow-lg"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <a href="/" className="flex items-center justify-center mb-4 space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 shadow-lg bg-slate-700 p-1 flex items-center justify-center">
                <img src="/ai-gen-logo.png" alt="AI Gen Platform Logo" className="w-6 h-6 rounded-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white leading-none">AI Gen Platform</h1>
            </a>
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            <p className="text-gray-300 mb-6">
              {error || 'Something went wrong with your payment.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200 shadow-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
