import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import AIRequestForm from './AIRequestForm';
import BuyCredits from './BuyCredits';
import SupportWidget from './SupportWidget';
import { aiAPI } from '../api';
import { Eye, Download } from 'lucide-react';

// Type for user requests
interface UserRequest {
  id: number;
  request_type: string;
  model: string;
  prompt: string;
  delivery_email: string;
  filenames: string[];  // Changed to array
  created_at: string;
  status: string;
  admin_response?: string;
  admin_file?: string;
  completed_at?: string;
}

// Component to fetch and display user requests
const UserRequests: React.FC<{ onShowRequest: (request: UserRequest) => void }> = ({ onShowRequest }) => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserRequests = async () => {
    try {
      const response = await aiAPI.getRequests();
      setRequests(response.data);
    } catch (err) {
      setError('Failed to load your requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  if (loading) return <p className="text-gray-300">Loading your requests...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (requests.length === 0) return <p className="text-gray-400">No requests yet.</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800/30 divide-y divide-slate-700">
            {requests.map((req) => (
              <tr 
                key={req.id} 
                className="hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-3 py-2 text-xs text-gray-300">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-xs text-gray-300">{req.request_type}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    req.status === 'Completed' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onShowRequest(req)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-md hover:bg-cyan-500/20 transition-colors duration-200"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Show
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);

  const showRequestDetails = (request: UserRequest) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const downloadFile = async (requestId: number) => {
    try {
      await aiAPI.downloadFile(requestId);
    } catch (err: any) {
      console.error('Failed to download file:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg border-b border-slate-700">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
            <a href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-cyan-400/30 shadow-lg bg-slate-700 p-1 flex items-center justify-center">
                <img src="/ai-gen-logo.png" alt="AI Gen Platform Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-none">AI Gen Platform</h1>
            </a>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-300 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                <span className="font-medium text-white">{user?.email}</span>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-medium">
                  {user?.credits || 0} credits
                </span>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {isAdmin && (
                  <a
                    href="/admin"
                    className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded-md hover:bg-cyan-500/10 transition-colors"
                  >
                    Admin
                  </a>
                )}
                <button
                  onClick={logout}
                  className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-8">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center">
            {/* Left Section - AI Request Form */}
            <div className="flex-1 lg:flex-[1.5] min-w-0 lg:min-w-[400px] max-w-3xl">
              <AIRequestForm />
            </div>

            {/* Middle Section - Your Requests */}
            <div className="flex-1 lg:flex-[1.2] min-w-0 lg:min-w-[350px] max-w-2xl">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-4 sm:p-6 h-fit">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Your Requests</h2>
                <UserRequests onShowRequest={showRequestDetails} />
              </div>
            </div>

            {/* Right Section - Buy Credits */}
            <div className="flex-1 lg:flex-[1] min-w-0 lg:min-w-[300px] max-w-xl">
              <BuyCredits />
            </div>
          </div>
        </div>
      </main>

      {/* Modal for request details - Positioned at top level */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-slate-800 border border-slate-600 w-full max-w-2xl shadow-2xl rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Request Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold transition-colors hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Request ID</label>
                  <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{selectedRequest.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{selectedRequest.request_type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                  <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{selectedRequest.model}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedRequest.status === 'Completed' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Email</label>
                  <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{selectedRequest.delivery_email}</p>
                </div>

                {selectedRequest.filenames && selectedRequest.filenames.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Uploaded Files</label>
                    <div className="bg-slate-700/50 px-3 py-2 rounded-md">
                      {selectedRequest.filenames.map((filename, index) => (
                        <p key={index} className="text-sm text-white">
                          {index + 1}. {filename}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
                  <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-md p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{selectedRequest.prompt}</p>
                  </div>
                </div>

                {selectedRequest.admin_response && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Admin Response</label>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 max-h-40 overflow-y-auto">
                      <p className="text-sm text-green-200 whitespace-pre-wrap break-words">{selectedRequest.admin_response}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.admin_file && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Admin File (If not working check your email)</label>
                    <button
                      onClick={() => downloadFile(selectedRequest.id)}
                      className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-500/30 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </button>
                  </div>
                )}

                {selectedRequest.completed_at && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Completed At</label>
                    <p className="text-sm text-white bg-slate-700/50 px-3 py-2 rounded-md">{new Date(selectedRequest.completed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-600 text-gray-200 rounded-md hover:bg-slate-500 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

export default Dashboard;
