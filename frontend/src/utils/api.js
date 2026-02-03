/**
 * API utility file for handling HTTP requests
 * Configures Axios instance with base URL and token handling
 */

import axios from 'axios';

// Create Axios instance with base configuration
// Default to backend on port 5000 (matches backend/server.js).
// You can override this with VITE_API_BASE_URL if needed.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    const anonymousId = sessionStorage.getItem('anonymousId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (anonymousId) {
      config.headers['X-Anonymous-Id'] = anonymousId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;