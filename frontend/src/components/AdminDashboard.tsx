import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, Clock, CheckCircle, AlertTriangle, Eye, Upload, Send, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../api';

interface AIRequest {
  id: number;
  user_email: string;
  request_type: string;
  model: string;
  prompt: string;
  filenames?: string[];  // Changed to array
  status: string;
  created_at: string;
  admin_response?: string;
  admin_file?: string;
  completed_at?: string;
}

interface AdminDashboardProps {
  onBack?: () => void;
}

interface StatusStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<StatusStats>({ total: 0, pending: 0, in_progress: 0, completed: 0, failed: 0 });
  
  // Submission form state
  const [responseText, setResponseText] = useState('');
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState('Completed');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const calculateStats = useCallback(() => {
    const newStats: StatusStats = {
      total: requests.length,
      pending: requests.filter(r => r.status.toLowerCase() === 'pending').length,
      in_progress: requests.filter(r => r.status.toLowerCase() === 'in_progress').length,
      completed: requests.filter(r => r.status.toLowerCase() === 'completed').length,
      failed: requests.filter(r => r.status.toLowerCase() === 'failed').length,
    };
    setStats(newStats);
  }, [requests]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const fetchRequests = async () => {
    try {
      const response = await aiAPI.getAllRequests();
      setRequests(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: number, newStatus: string) => {
    try {
      await aiAPI.updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const showRequestDetails = (request: AIRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const showSubmissionForm = (request: AIRequest) => {
    setSelectedRequest(request);
    setResponseText('');
    setResponseFile(null);
    setSubmissionStatus('Completed');
    setShowModal(false);
    setShowSubmissionModal(true);
  };

  const submitResult = async () => {
    if (!selectedRequest) return;
    
    setSubmissionLoading(true);
    try {
      const formData = new FormData();
      if (responseText.trim()) {
        formData.append('response_text', responseText.trim());
      }
      formData.append('status', submissionStatus);
      if (responseFile) {
        formData.append('file', responseFile);
      }

      await aiAPI.submitAdminResult(selectedRequest.id, formData);
      setShowSubmissionModal(false);
      setSelectedRequest(null);
      fetchRequests();
      alert('Result submitted successfully! User has been notified via email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit result');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const downloadAdminFile = async (requestId: number) => {
    try {
      const response = await aiAPI.downloadFile(requestId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_result_${requestId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowSubmissionModal(false);
    setSelectedRequest(null);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status.toLowerCase() === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <span className="text-gray-300 text-lg">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-lg">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                <span className="sm:hidden font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-400">
              Total Requests: {stats.total}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Stats Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-300 text-sm font-medium mr-3">Filter by status:</span>
            {['all', 'pending', 'in_progress', 'completed', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${
                  filterStatus === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700/50 text-gray-400 border border-slate-600 hover:bg-slate-600/50'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              AI Requests ({filteredRequests.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prompt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-700/30 transition-colors duration-200">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="capitalize">{request.request_type}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="max-w-32 truncate" title={request.user_email}>
                        {request.user_email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      <div className="max-w-48 truncate" title={request.prompt}>
                        {request.prompt}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={request.status}
                          onChange={(e) => updateStatus(request.id, e.target.value)}
                          className="text-xs bg-slate-700 border border-slate-600 text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                        <button
                          onClick={() => showRequestDetails(request)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors duration-200"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => showSubmissionForm(request)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/30 rounded hover:bg-green-500/20 transition-colors duration-200"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Submit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterStatus === 'all' ? 'No AI requests have been submitted yet.' : `No ${filterStatus.replace('_', ' ')} requests found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Request Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-300">User Email</p>
                    <p className="text-sm text-gray-400 mt-1">{selectedRequest.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Request Type</p>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{selectedRequest.request_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Created At</p>
                    <p className="text-sm text-gray-400 mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300">Prompt</p>
                  <div className="text-sm text-gray-400 whitespace-pre-wrap bg-slate-700/50 rounded-lg p-4 mt-2 border border-slate-600">
                    {selectedRequest.prompt}
                  </div>
                </div>

                {selectedRequest.filenames && selectedRequest.filenames.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-300">Attached Files</p>
                    <div className="mt-1">
                      {selectedRequest.filenames.map((filename, index) => (
                        <p key={index} className="text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded inline-block mr-2 mb-1">
                          {filename}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.admin_response && (
                  <div>
                    <p className="text-sm font-medium text-gray-300">Admin Response</p>
                    <div className="text-sm text-gray-400 whitespace-pre-wrap bg-slate-700/50 rounded-lg p-4 mt-2 border border-slate-600">
                      {selectedRequest.admin_response}
                    </div>
                  </div>
                )}

                {selectedRequest.admin_file && (
                  <div>
                    <p className="text-sm font-medium text-gray-300">Admin File</p>
                    <button
                      onClick={() => downloadAdminFile(selectedRequest.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors duration-200 mt-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Result File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700 px-6 py-4 bg-slate-700/30">
              <div className="flex justify-between">
                <button
                  onClick={() => showSubmissionForm(selectedRequest)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/30 rounded-md hover:bg-green-500/20 transition-colors duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Result
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-slate-600 border border-slate-500 rounded-md hover:bg-slate-500 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Submission Modal */}
      {showSubmissionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Submit Result to User</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Submitting result for:</p>
                  <p className="font-medium text-white">{selectedRequest.user_email}</p>
                  <p className="text-sm text-gray-400 capitalize">{selectedRequest.request_type} Request</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={submissionStatus}
                    onChange={(e) => setSubmissionStatus(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Response Text
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response to the user..."
                    className="w-full h-32 bg-slate-700 border border-slate-600 text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attach File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={(e) => setResponseFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">
                        {responseFile ? responseFile.name : 'Click to upload file'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 px-6 py-4 bg-slate-700/30">
              <div className="flex justify-between">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-slate-600 border border-slate-500 rounded-md hover:bg-slate-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResult}
                  disabled={submissionLoading || (!responseText.trim() && !responseFile)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-500 rounded-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submissionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit & Notify User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
