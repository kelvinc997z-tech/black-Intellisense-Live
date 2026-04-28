import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const backendBaseUrl = isLocalhost
  ? 'http://localhost:8001'
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001');
const API_URL = backendBaseUrl + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellitrade_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('intellitrade_token');
      localStorage.removeItem('intellitrade_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
