import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
  
  getAdminStatus: () => api.get('/auth/admin-status'),
};

// Credits API
export const creditsAPI = {
  getPackages: () => api.get('/credits/packages'),
  
  createCheckoutSession: (credits: number) =>
    api.post('/credits/create-checkout-session', { credits }),
  
  verifyPayment: (sessionId: string) =>
    api.post('/credits/verify-payment', null, { params: { session_id: sessionId } }),
};

// AI Request API
export const aiAPI = {
  submitRequest: (formData: FormData) =>
    api.post('/ai/request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getRequests: () => api.get('/ai/requests'),
  
  getAllRequests: () => api.get('/admin/requests'),
  
  updateRequestStatus: (id: number, status: string) =>
    api.post(`/admin/requests/${id}/status`, { status }),
  
  submitAdminResult: (id: number, formData: FormData) =>
    api.post(`/admin/requests/${id}/submit-result`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  downloadFile: (id: number) =>
    api.get(`/admin/download/${id}`, { responseType: 'blob' }),
};

export default api;
