<template>
  <div class="flight-results">
    <div class="results-header">
      <div class="logo-container">
        <img src="/images/logo.jpg" alt="Avocado Air Logo" class="results-logo">
      </div>
      <h1>{{ $t('flights.searchResults') }}</h1>
    </div>
    
    <div class="search-details">
      <div class="search-params">
        <div class="param-group">
          <span class="param-label">{{ $t('search.from') }}:</span>
          <span class="param-value">{{ getAirportName(searchParams.origin) }}</span>
        </div>
        <div class="param-group">
          <span class="param-label">{{ $t('search.to') }}:</span>
          <span class="param-value">{{ getAirportName(searchParams.destination) }}</span>
        </div>
        <div class="param-group">
          <span class="param-label">{{ $t('search.departure') }}:</span>
          <span class="param-value">{{ searchParams.departureDate }}</span>
        </div>
        <div class="param-group" v-if="searchParams.returnDate">
          <span class="param-label">{{ $t('search.return') }}:</span>
          <span class="param-value">{{ searchParams.returnDate }}</span>
        </div>
        <div class="param-group">
          <span class="param-label">{{ $t('search.passengers') }}:</span>
          <span class="param-value">{{ searchParams.passengers }}</span>
        </div>
      </div>
      
      <button @click="modifySearch" class="btn btn-secondary">{{ $t('flights.modifySearch') }}</button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="retrySearch" class="btn btn-primary">{{ $t('common.tryAgain') }}</button>
    </div>
    
    <div v-else>
      <!-- Outbound Flights -->
      <div class="flight-section">
        <h2>{{ $t('flights.outbound') }}</h2>
        <div v-if="outboundFlights.length === 0" class="no-flights">
          <p>{{ $t('flights.noResults') }}</p>
        </div>
        <div v-else class="flight-list">
          <div 
            v-for="flight in outboundFlights" 
            :key="flight.id" 
            class="flight-card"
            :class="{ 'selected': selectedOutboundFlight === flight.id }"
            @click="selectOutboundFlight(flight.id)"
          >
            <div class="flight-header">
              <span class="flight-number">{{ flight.flight_number }}</span>
              <span class="flight-price">${{ flight.price }}</span>
            </div>
            
            <div class="flight-details">
              <div class="flight-route">
                <div class="departure">
                  <span class="time">{{ formatTime(flight.departure_time) }}</span>
                  <span class="airport">{{ flight.origin }}</span>
                </div>
                
                <div class="flight-duration">
                  <div class="duration-line"></div>
                  <span class="duration">{{ calculateDuration(flight.departure_time, flight.arrival_time) }}</span>
                </div>
                
                <div class="arrival">
                  <span class="time">{{ formatTime(flight.arrival_time) }}</span>
                  <span class="airport">{{ flight.destination }}</span>
                </div>
              </div>
              
              <div class="flight-info">
                <span class="seats">{{ flight.available_seats }} {{ $t('flights.seatsAvailable') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Return Flights (if applicable) -->
      <div v-if="searchParams.returnDate" class="flight-section">
        <h2>{{ $t('flights.return') }}</h2>
        <div v-if="returnFlights.length === 0" class="no-flights">
          <p>{{ $t('flights.noReturnResults') }}</p>
        </div>
        <div v-else class="flight-list">
          <div 
            v-for="flight in returnFlights" 
            :key="flight.id" 
            class="flight-card"
            :class="{ 'selected': selectedReturnFlight === flight.id }"
            @click="selectReturnFlight(flight.id)"
          >
            <div class="flight-header">
              <span class="flight-number">{{ flight.flight_number }}</span>
              <span class="flight-price">${{ flight.price }}</span>
            </div>
            
            <div class="flight-details">
              <div class="flight-route">
                <div class="departure">
                  <span class="time">{{ formatTime(flight.departure_time) }}</span>
                  <span class="airport">{{ flight.origin }}</span>
                </div>
                
                <div class="flight-duration">
                  <div class="duration-line"></div>
                  <span class="duration">{{ calculateDuration(flight.departure_time, flight.arrival_time) }}</span>
                </div>
                
                <div class="arrival">
                  <span class="time">{{ formatTime(flight.arrival_time) }}</span>
                  <span class="airport">{{ flight.destination }}</span>
                </div>
              </div>
              
              <div class="flight-info">
                <span class="seats">{{ flight.available_seats }} {{ $t('flights.seatsAvailable') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Booking Summary and Controls -->
      <div class="booking-summary" v-if="showBookingControls">
        <h3>{{ $t('booking.summary') }}</h3>
        <div class="summary-details">
          <div class="summary-row">
            <span>{{ $t('flights.outbound') }}:</span>
            <span>{{ getSelectedFlightNumber(selectedOutboundFlight, outboundFlights) }}</span>
          </div>
          <div class="summary-row" v-if="searchParams.returnDate && selectedReturnFlight">
            <span>{{ $t('flights.return') }}:</span>
            <span>{{ getSelectedFlightNumber(selectedReturnFlight, returnFlights) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('search.passengers') }}:</span>
            <span>{{ searchParams.passengers }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ $t('booking.total') }}:</span>
            <span>${{ calculateTotalPrice() }}</span>
          </div>
        </div>
        
        <button 
          @click="proceedToBooking" 
          class="btn btn-primary"
          :disabled="!canProceed"
        >
          {{ $t('booking.proceed') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAirportName } from '../constants/airports';
import { formatTime, formatPrice, calculateDuration } from '../utils/formatters';
import { useStore } from 'vuex';

export default {
  name: 'FlightResults',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    
    // Extract search parameters from the URL
    const searchParams = ref({
      origin: route.query.origin || '',
      destination: route.query.destination || '',
      departureDate: route.query.departureDate || '',
      returnDate: route.query.returnDate || '',
      passengers: route.query.passengers || '1'
    });
    
    const loading = ref(true);
    const error = ref('');
    const outboundFlights = ref([]);
    const returnFlights = ref([]);
    const selectedOutboundFlight = ref(null);
    const selectedReturnFlight = ref(null);
    
    // Select outbound flight
    const selectOutboundFlight = (flightId) => {
      selectedOutboundFlight.value = flightId;
    };
    
    // Select return flight
    const selectReturnFlight = (flightId) => {
      selectedReturnFlight.value = flightId;
    };
    
    // Get flight number by ID
    const getSelectedFlightNumber = (flightId, flightList) => {
      const flight = flightList.find(f => f.id === flightId);
      return flight ? flight.flight_number : 'N/A';
    };
    
    // Calculate total price
    const calculateTotalPrice = () => {
      let total = 0;
      const passengers = parseInt(searchParams.value.passengers);
      
      const outboundFlight = outboundFlights.value.find(f => f.id === selectedOutboundFlight.value);
      if (outboundFlight) {
        total += outboundFlight.price;
      }
      
      const returnFlight = returnFlights.value.find(f => f.id === selectedReturnFlight.value);
      if (returnFlight) {
        total += returnFlight.price;
      }
      
      return formatPrice(total * passengers);
    };
    
    // Check if can proceed with booking
    const canProceed = computed(() => {
      if (!selectedOutboundFlight.value) return false;
      if (searchParams.value.returnDate && !selectedReturnFlight.value) return false;
      return true;
    });
    
    // Show booking controls if flights are selected
    const showBookingControls = computed(() => {
      return selectedOutboundFlight.value || selectedReturnFlight.value;
    });
    
    // Proceed to booking
    const proceedToBooking = () => {
      // Check if user is authenticated
      if (!store.getters['auth/isAuthenticated']) {
        // Redirect to login page with return URL
        router.push({ 
          name: 'Login', 
          query: { 
            redirect: router.resolve({ 
              name: 'BookingForm',
              params: { flightId: selectedOutboundFlight.value },
              query: { 
                returnFlightId: selectedReturnFlight.value,
                passengers: searchParams.value.passengers
              }
            }).href
          }
        });
        return;
      }
      
      // If authenticated, proceed to booking
      router.push({ 
        name: 'BookingForm',
        params: { flightId: selectedOutboundFlight.value },
        query: { 
          returnFlightId: selectedReturnFlight.value,
          passengers: searchParams.value.passengers
        }
      });
    };
    
    // Fetch flights from the API
    const fetchFlights = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // In a real application, this would call the API
        // For demonstration, we'll simulate API response with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample outbound flights
        outboundFlights.value = [
          {
            id: 1,
            flight_number: 'AA101',
            origin: searchParams.value.origin,
            destination: searchParams.value.destination,
            departure_time: '2023-12-01T08:00:00Z',
            arrival_time: '2023-12-01T10:30:00Z',
            price: 299.99,
            available_seats: 45
          },
          {
            id: 2,
            flight_number: 'AA103',
            origin: searchParams.value.origin,
            destination: searchParams.value.destination,
            departure_time: '2023-12-01T12:00:00Z',
            arrival_time: '2023-12-01T14:30:00Z',
            price: 349.99,
            available_seats: 23
          },
          {
            id: 3,
            flight_number: 'AA105',
            origin: searchParams.value.origin,
            destination: searchParams.value.destination,
            departure_time: '2023-12-01T16:00:00Z',
            arrival_time: '2023-12-01T18:30:00Z',
            price: 249.99,
            available_seats: 12
          }
        ];
        
        if (searchParams.value.returnDate) {
          returnFlights.value = [
            {
              id: 4,
              flight_number: 'AA102',
              origin: searchParams.value.destination,
              destination: searchParams.value.origin,
              departure_time: '2023-12-05T09:00:00Z',
              arrival_time: '2023-12-05T11:30:00Z',
              price: 319.99,
              available_seats: 38
            },
            {
              id: 5,
              flight_number: 'AA104',
              origin: searchParams.value.destination,
              destination: searchParams.value.origin,
              departure_time: '2023-12-05T13:00:00Z',
              arrival_time: '2023-12-05T15:30:00Z',
              price: 379.99,
              available_seats: 15
            },
            {
              id: 6,
              flight_number: 'AA106',
              origin: searchParams.value.destination,
              destination: searchParams.value.origin,
              departure_time: '2023-12-05T17:00:00Z',
              arrival_time: '2023-12-05T19:30:00Z',
              price: 289.99,
              available_seats: 7
            }
          ];
        }
      } catch (err) {
        console.error('Error fetching flights:', err);
        error.value = 'Failed to load flights. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    // Fetch flights when component mounts
    onMounted(() => {
      fetchFlights();
    });
    
    // Go back to search page
    const modifySearch = () => {
      router.push({ name: 'FlightSearch' });
    };
    
    // Try the search again
    const retrySearch = () => {
      fetchFlights();
    };
    
    return {
      searchParams,
      loading,
      error,
      outboundFlights,
      returnFlights,
      selectedOutboundFlight,
      selectedReturnFlight,
      getAirportName,
      formatTime,
      calculateDuration,
      selectOutboundFlight,
      selectReturnFlight,
      getSelectedFlightNumber,
      calculateTotalPrice,
      canProceed,
      showBookingControls,
      proceedToBooking,
      modifySearch,
      retrySearch
    };
  }
};
</script>

<style scoped>
.flight-results {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.results-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  margin-bottom: 1rem;
}

.results-logo {
  width: 120px;
  height: auto;
  border-radius: 50%;
  border: 3px solid #17b978;
}

.results-header h1 {
  color: #118c5b;
  margin: 0;
}

.search-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e6e6e6;
}

.search-params {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.param-group {
  margin-right: 1.5rem;
}

.param-label {
  font-weight: bold;
  color: #118c5b;
  margin-right: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #17b978;
  color: white;
}

.btn-primary:hover {
  background-color: #118c5b;
}

.btn-secondary {
  background-color: #4de9aa;
  color: #118c5b;
}

.btn-secondary:hover {
  background-color: #20e395;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.loading-container, .error-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #17b978;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #721c24;
  margin-bottom: 1.5rem;
}

.flight-section {
  margin-bottom: 3rem;
}

.flight-section h2 {
  color: #118c5b;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.flight-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #17b978;
}

.no-flights {
  background-color: #f9f9f9;
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed #e6e6e6;
}

.flight-list {
  display: grid;
  gap: 1.5rem;
}

.flight-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
  border: 1px solid #e6e6e6;
}

.flight-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.flight-card.selected {
  border: 2px solid #17b978;
  box-shadow: 0 0 0 2px rgba(23, 185, 120, 0.2);
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e6e6e6;
}

.flight-number {
  font-weight: bold;
  color: #118c5b;
}

.flight-price {
  font-weight: bold;
  color: #17b978;
  font-size: 1.25rem;
}

.flight-details {
  display: flex;
  flex-direction: column;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.departure, .arrival {
  text-align: center;
}

.time {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.airport {
  display: block;
  font-size: 0.875rem;
  color: #666;
}

.flight-duration {
  flex: 1;
  padding: 0 1rem;
  position: relative;
  text-align: center;
}

.duration-line {
  height: 2px;
  background-color: #e6e6e6;
  margin-bottom: 0.5rem;
  position: relative;
}

.duration-line::before, .duration-line::after {
  content: '•';
  position: absolute;
  top: -8px;
  color: #17b978;
}

.duration-line::before {
  left: 0;
}

.duration-line::after {
  right: 0;
}

.duration {
  font-size: 0.875rem;
  color: #666;
}

.flight-info {
  display: flex;
  justify-content: flex-end;
}

.seats {
  background-color: #e6e6e6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #118c5b;
}

.booking-summary {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  border: 1px solid #e6e6e6;
}

.booking-summary h3 {
  color: #118c5b;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 0.75rem;
}

.summary-details {
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-row.total {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #e6e6e6;
  font-weight: bold;
  font-size: 1.25rem;
  color: #17b978;
}

@media (max-width: 768px) {
  .flight-results {
    padding: 1rem;
  }
  
  .search-details {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .search-params {
    flex-direction: column;
    width: 100%;
  }
  
  .param-group {
    margin-right: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 0.5rem;
  }
  
  .flight-route {
    flex-direction: column;
    gap: 1rem;
  }
  
  .flight-duration {
    padding: 1rem 0;
  }
  
  .duration-line {
    transform: rotate(90deg);
    width: 50px;
    margin: 0 auto;
  }
}
</style> 