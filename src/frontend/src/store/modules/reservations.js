import api from '../../utils/api';

// Initial state
const state = {
  userReservations: [],
  currentReservation: null,
  loading: false,
  error: null
};

// Getters
const getters = {
  userReservations: state => state.userReservations,
  currentReservation: state => state.currentReservation,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error
};

// Actions
const actions = {
  // Create a new reservation
  async createReservation({ commit }, reservationData) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      const response = await api.post('/api/reservations', reservationData);
      commit('SET_LOADING', false);
      return { 
        success: true, 
        reservationId: response.data.reservationId,
        totalPrice: response.data.totalPrice
      };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to create reservation');
      commit('SET_LOADING', false);
      return { success: false };
    }
  },
  
  // Process payment for a reservation
  async processPayment({ commit }, { reservationId, paymentData }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      const response = await api.post(`/api/reservations/${reservationId}/payment`, paymentData);
      commit('SET_LOADING', false);
      return { 
        success: true, 
        transactionId: response.data.transactionId 
      };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Payment processing failed');
      commit('SET_LOADING', false);
      return { success: false };
    }
  },
  
  // Get all user reservations
  async getUserReservations({ commit }) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      console.log('Calling API to get user reservations');
      // Use the full API path to ensure correct routing
      const response = await api.get('/api/reservations/');
      console.log('Received reservations data:', response.data);
      
      // If the API returns an empty array or no data, set an empty array
      const reservations = response.data || [];
      
      commit('SET_USER_RESERVATIONS', reservations);
      commit('SET_LOADING', false);
      return { success: true };
    } catch (error) {
      console.error('Error getting reservations:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.status === 401 ? 'Authentication required' : 'Failed to get reservations');
      
      commit('SET_ERROR', errorMessage);
      commit('SET_LOADING', false);
      
      // If unauthorized, return a specific message
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Please log in to view your reservations',
          unauthorized: true
        };
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  },
  
  // Get reservation details by ID
  async getReservation({ commit }, reservationId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      const response = await api.get(`/api/reservations/${reservationId}`);
      commit('SET_CURRENT_RESERVATION', response.data);
      commit('SET_LOADING', false);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to get reservation details');
      commit('SET_LOADING', false);
      return { success: false };
    }
  },
  
  // Cancel a reservation
  async cancelReservation({ commit, dispatch }, reservationId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      await api.delete(`/api/reservations/${reservationId}`);
      
      // Refresh user reservations after cancellation
      await dispatch('getUserReservations');
      
      commit('SET_LOADING', false);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to cancel reservation');
      commit('SET_LOADING', false);
      return { success: false };
    }
  }
};

// Mutations
const mutations = {
  SET_USER_RESERVATIONS(state, reservations) {
    state.userReservations = reservations;
  },
  SET_CURRENT_RESERVATION(state, reservation) {
    state.currentReservation = reservation;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_ERROR(state, message) {
    state.error = message;
  },
  CLEAR_ERROR(state) {
    state.error = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 