import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../api';

interface SupportWidgetProps {
  className?: string;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError('Please fill in both email and message fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/support/contact', {
        email: email.trim(),
        message: message.trim(),
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      
      setSuccess(true);
      setEmail('');
      setMessage('');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
    setSuccess(false);
    setError('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Support Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
          aria-label="Open Support Chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Need Help?
          </span>
        </button>
      )}

      {/* Support Chat Widget */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 w-80 max-w-[calc(100vw-2rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-xs opacity-90">We're here to help!</p>
              </div>
            </div>
            <button
              onClick={closeWidget}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close Support Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Thank you for contacting us. We'll get back to you soon!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    How can we help?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Usually responds within a few hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportWidget;
