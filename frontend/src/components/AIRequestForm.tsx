import React, { useState, useEffect } from 'react';
import { aiAPI } from '../api';
import { useAuth } from '../AuthContext';

const AIRequestForm: React.FC = () => {
  const [requestType, setRequestType] = useState('Text');
  const [model, setModel] = useState('GPT-3.5-Turbo');
  const [prompt, setPrompt] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { user, updateUser } = useAuth();

  // Update model when request type changes
  useEffect(() => {
    if (requestType === 'Image') {
      // Set DALL-E 3 for images
      setModel('DALL-E-3');
    } else if (model === '' || model === 'DALL-E-3') {
      // Default to GPT-3.5-Turbo for text/code
      setModel('GPT-3.5-Turbo');
    }
  }, [requestType, model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || user.credits < 1) {
      setError('Insufficient credits. Please purchase credits first.');
      return;
    }

    // Auto-set model for image requests
    if (requestType === 'Image' && model !== 'DALL-E-3') {
      setModel('DALL-E-3');
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('request_type', requestType);
      formData.append('model', model);
      formData.append('prompt', prompt);
      formData.append('delivery_email', deliveryEmail);
      
      // Append all files
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      await aiAPI.submitRequest(formData);
      
      setSuccess('Request submitted successfully! Check your email for delivery.');
      setPrompt('');
      setFiles([]);
      
      // Update user credits
      await updateUser();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // Check file types
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
      const invalidFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError('Please upload only PDF, image, or text files');
        return;
      }
      
      // Add new files to existing files
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      // Clear the input to allow selecting same file again
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-white">AI Request Form</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Request Type
          </label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="Text">Text</option>
            <option value="Image">Image</option>
            <option value="Code">Code</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={requestType === 'Image'}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-600/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestType === 'Text' && (
              <>
                <option value="GPT-3.5-Turbo">GPT-3.5 Turbo</option>
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-4-Turbo">GPT-4 Turbo</option>
              </>
            )}
            {requestType === 'Code' && (
              <>
                <option value="GPT-3.5-Turbo">GPT-3.5 Turbo</option>
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-4-Turbo">GPT-4 Turbo</option>
              </>
            )}
            {requestType === 'Image' && (
              <option value="DALL-E-3">DALL-E 3</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Describe what you want the AI to generate..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            File Upload (Optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
            multiple
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <p className="text-sm text-gray-400 mt-1">
            Supported: PDF, images (JPG, PNG, GIF), text files. Click to add multiple files.
          </p>
          
          {/* Display selected files */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-300">Selected Files:</p>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700/30 px-3 py-2 rounded border border-slate-600">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Delivery Email
          </label>
          <input
            type="email"
            value={deliveryEmail}
            onChange={(e) => setDeliveryEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Where should we send the result?"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !user || user.credits < 1}
          className="w-full bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition duration-200 font-medium"
        >
          {loading ? 'Submitting...' : `Submit Request (1 Credit)`}
        </button>
        
        {user && user.credits < 1 && (
          <p className="text-red-400 text-sm text-center">
            You need at least 1 credit to submit a request.
          </p>
        )}
      </form>
    </div>
  );
};

export default AIRequestForm;
