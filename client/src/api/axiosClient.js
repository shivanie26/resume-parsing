import axios from 'axios';

// Dynamically determine the best API Base URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If explicitly specified with a production remote domain
  if (envUrl && (!import.meta.env.PROD || !envUrl.includes('localhost'))) {
    return envUrl;
  }
  // Relative path '/api' guarantees zero CORS and zero IP/port mismatch in both dev proxy and unified production deploy
  if (typeof window !== 'undefined' && window.location) {
    return '/api';
  }
  return envUrl || '/api';
};

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_resume_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Delete Content-Type if FormData to allow browser to generate boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry and network error messages
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('smart_resume_token');
        localStorage.removeItem('smart_resume_user');
        window.location.href = '/login?expired=true';
      }
    } else if (!error.response || error.code === 'ERR_NETWORK') {
      // Improve network error message for user
      error.message = 'Unable to connect to server. Please verify the backend service is running and your connection is active.';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
