import axios from 'axios';
import router from '../router';
import store from '../store';

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // Use environment variable if available, otherwise use default
  const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:6060';
  console.log('Environment variables:', {
    VUE_APP_API_URL: process.env.VUE_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  console.log('Using API URL:', baseUrl);
  return baseUrl;
};

// Log the base URL
const baseUrl = getBaseUrl();
console.log('API Base URL:', baseUrl);

// Create axios instance with the correct base URL
const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add request interceptor to set auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token found and added to request');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses and handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    });
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected, redirecting to login');
      
      // Clear auth data
      store.dispatch('auth/logout');
      
      // Redirect to login page if not already there
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ 
          name: 'Login', 
          query: { redirect: router.currentRoute.value.fullPath }
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 