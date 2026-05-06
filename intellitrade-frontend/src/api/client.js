import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.klepon.cfd/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const zkApi = {
  getThreshold: () => api.get('/verify/solvency/threshold'),
  submitProof: (proofData) => api.post('/verify/solvency/verify', proofData),
  submitIdentityProof: (proofData) => api.post('/verify/identity/verify', proofData),
  getStatus: () => api.get('/verify/status'),
};
