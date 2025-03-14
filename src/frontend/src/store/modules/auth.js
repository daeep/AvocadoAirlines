import api from '../../utils/api';

// Initial state
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token')
};

// Getters
const getters = {
  isAuthenticated: state => state.isAuthenticated,
  currentUser: state => state.user,
  token: state => state.token
};

// Actions
const actions = {
  // Register a new user
  async register({ commit }, userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Commit mutations
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      commit('SET_AUTH', true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  },
  
  // Login user
  async login({ commit }, credentials) {
    try {
      console.log('Login attempt with credentials:', { ...credentials, password: '***' });
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Commit mutations
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      commit('SET_AUTH', true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  },
  
  // Logout user
  logout({ commit }) {
    try {
      // Remove token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      commit('RESET_AUTH');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },
  
  // Initialize auth from localStorage
  initAuth({ commit }) {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (token && user) {
        // Commit mutations
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        commit('SET_AUTH', true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      commit('RESET_AUTH');
    }
  }
};

// Mutations
const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },
  SET_USER(state, user) {
    state.user = user;
  },
  SET_AUTH(state, value) {
    state.isAuthenticated = value;
  },
  RESET_AUTH(state) {
    state.token = null;
    state.user = null;
    state.isAuthenticated = false;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 