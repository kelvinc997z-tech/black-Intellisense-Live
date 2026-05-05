import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// On Vercel, if REACT_APP_BACKEND_URL is not set, we use current origin
const getBaseUrl = () => {
  if (isLocalhost) return 'http://localhost:8001';
  if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL;
  return typeof window !== 'undefined' ? window.location.origin : '';
};

const backendBaseUrl = getBaseUrl();
const API_URL = backendBaseUrl.endsWith('/api') ? backendBaseUrl : backendBaseUrl + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
