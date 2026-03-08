import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `http://${import.meta.env.VITE_BACKEND_URL || 'localhost:8000'}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Logout function
export const logout = async () => {
  try {
    const response = await api.post('/api/v1/users/auth/logout');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
