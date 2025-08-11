import React, { useState, useEffect } from 'react';
import { creditsAPI } from '../api';
import { useAuth } from '../AuthContext';

interface CreditPackage {
  credits: number;
  price: number;
  price_id: string;
}

const BuyCredits: React.FC = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await creditsAPI.getPackages();
        setPackages(response.data);
      } catch (error: any) {
        console.error('Failed to fetch packages:', error);
        setError('Failed to load credit packages');
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (credits: number) => {
    setLoading(true);
    setError('');
    
    console.log(`Attempting to purchase ${credits} credits...`);
    
    try {
      console.log('Creating checkout session...');
      const response = await creditsAPI.createCheckoutSession(credits);
      console.log('Checkout session response:', response.data);
      
      if (response.data.checkout_url) {
        console.log('Redirecting to Stripe checkout...');
        window.location.href = response.data.checkout_url;
      } else {
        console.error('No checkout URL received');
        setError('Failed to create checkout session - no URL received');
      }
    } catch (error: any) {
      console.error('Checkout session error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data?.detail || 'Failed to create checkout session');
      } else if (error.request) {
        console.error('Network error:', error.request);
        setError('Network error - please check your connection');
      } else {
        console.error('Request setup error:', error.message);
        setError('Failed to create checkout session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-white">Buy Credits</h2>
      
      <div className="mb-6 p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
        <h3 className="font-semibold text-cyan-400">Your Current Balance</h3>
        <p className="text-2xl font-bold text-cyan-300">
          {user?.credits || 0} Credits
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.credits}
            className="border border-slate-600 bg-slate-700/50 rounded-lg p-4 flex justify-between items-center hover:bg-slate-700/70 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-lg text-white">
                {pkg.credits} Credit{pkg.credits > 1 ? 's' : ''}
              </h3>
              <p className="text-gray-400">
                ${pkg.price.toFixed(2)} ({(pkg.price / pkg.credits).toFixed(2)} per credit)
              </p>
            </div>
            <button
              onClick={() => handlePurchase(pkg.credits)}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition duration-200 font-medium"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p className="mb-2">💳 Secure payment powered by Stripe</p>
        <p className="mb-2">🔒 Your payment information is safe and encrypted</p>
        <p>📧 Credits are added instantly after successful payment</p>
      </div>
    </div>
  );
};

export default BuyCredits;
