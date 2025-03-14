import api from '../../utils/api';

// Initial state
const state = {
  searchResults: {
    outboundFlights: [],
    returnFlights: []
  },
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
  loading: false,
  error: null
};

// Getters
const getters = {
  searchResults: state => state.searchResults,
  selectedOutboundFlight: state => state.selectedOutboundFlight,
  selectedReturnFlight: state => state.selectedReturnFlight,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error
};

// Actions
const actions = {
  // Search for flights
  async searchFlights({ commit }, searchParams) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          queryParams.append(key, searchParams[key]);
        }
      });
      
      // Make API request
      const response = await api.get(`/api/flights/search?${queryParams.toString()}`);
      
      // Commit search results
      commit('SET_SEARCH_RESULTS', response.data);
      commit('SET_LOADING', false);
      return { success: true };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to search flights');
      commit('SET_LOADING', false);
      return { success: false };
    }
  },
  
  // Get flight details by ID
  async getFlightDetails({ commit }, flightId) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');
    
    try {
      const response = await api.get(`/api/flights/${flightId}`);
      commit('SET_LOADING', false);
      return { success: true, flight: response.data };
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to get flight details');
      commit('SET_LOADING', false);
      return { success: false };
    }
  },
  
  // Select outbound flight
  selectOutboundFlight({ commit }, flightId) {
    commit('SET_SELECTED_OUTBOUND_FLIGHT', flightId);
    return { success: true };
  },
  
  // Select return flight
  selectReturnFlight({ commit }, flightId) {
    commit('SET_SELECTED_RETURN_FLIGHT', flightId);
    return { success: true };
  },
  
  // Clear flight selection
  clearFlightSelection({ commit }) {
    commit('CLEAR_FLIGHT_SELECTION');
    return { success: true };
  }
};

// Mutations
const mutations = {
  SET_SEARCH_RESULTS(state, results) {
    state.searchResults = results;
  },
  SET_SELECTED_OUTBOUND_FLIGHT(state, flight) {
    state.selectedOutboundFlight = flight;
  },
  SET_SELECTED_RETURN_FLIGHT(state, flight) {
    state.selectedReturnFlight = flight;
  },
  CLEAR_FLIGHT_SELECTION(state) {
    state.selectedOutboundFlight = null;
    state.selectedReturnFlight = null;
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