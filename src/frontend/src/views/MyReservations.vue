<template>
  <div class="my-reservations">
    <div class="reservations-header">
      <img src="/images/logo.jpg" alt="Avocado Air Logo" class="header-logo" />
      <h1>My Reservations</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your reservations...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchReservations" class="btn btn-primary">Try Again</button>
    </div>
    
    <div v-else-if="reservations.length === 0" class="no-reservations">
      <div class="empty-state">
        <i class="fas fa-ticket-alt empty-icon"></i>
        <h2>No Reservations Found</h2>
        <p>You don't have any flight reservations yet.</p>
        <router-link to="/flights" class="btn btn-primary">Search Flights</router-link>
      </div>
    </div>
    
    <div v-else class="reservations-list">
      <div 
        v-for="reservation in reservations" 
        :key="reservation.id"
        class="reservation-card"
      >
        <div class="reservation-header">
          <div class="reservation-info">
            <span class="reservation-number">Booking #{{ reservation.confirmationNumber }}</span>
            <span class="reservation-date">Booked on {{ formatDate(reservation.bookingDate) }}</span>
          </div>
          <div class="reservation-status" :class="reservation.status.toLowerCase()">
            {{ reservation.status }}
          </div>
        </div>
        
        <div class="flight-summary">
          <div class="flight-info">
            <div class="flight-route">
              <div class="route-item">
                <span class="city">{{ getAirportName(reservation.outboundFlight.origin) }}</span>
                <span class="time">{{ formatTime(reservation.outboundFlight.departureTime) }}</span>
                <span class="date">{{ formatDate(reservation.outboundFlight.departureTime) }}</span>
              </div>
              
              <div class="route-arrow">→</div>
              
              <div class="route-item">
                <span class="city">{{ getAirportName(reservation.outboundFlight.destination) }}</span>
                <span class="time">{{ formatTime(reservation.outboundFlight.arrivalTime) }}</span>
                <span class="date">{{ formatDate(reservation.outboundFlight.arrivalTime) }}</span>
              </div>
            </div>
            
            <div class="flight-meta">
              <span class="flight-number">{{ reservation.outboundFlight.flightNumber }}</span>
              <span class="passengers">{{ reservation.passengers.length }} passenger(s)</span>
            </div>
          </div>
          
          <div v-if="reservation.returnFlight" class="flight-info return-flight">
            <div class="flight-route">
              <div class="route-item">
                <span class="city">{{ getAirportName(reservation.returnFlight.origin) }}</span>
                <span class="time">{{ formatTime(reservation.returnFlight.departureTime) }}</span>
                <span class="date">{{ formatDate(reservation.returnFlight.departureTime) }}</span>
              </div>
              
              <div class="route-arrow">→</div>
              
              <div class="route-item">
                <span class="city">{{ getAirportName(reservation.returnFlight.destination) }}</span>
                <span class="time">{{ formatTime(reservation.returnFlight.arrivalTime) }}</span>
                <span class="date">{{ formatDate(reservation.returnFlight.arrivalTime) }}</span>
              </div>
            </div>
            
            <div class="flight-meta">
              <span class="flight-number">{{ reservation.returnFlight.flightNumber }}</span>
              <span class="passengers">{{ reservation.passengers.length }} passenger(s)</span>
            </div>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button 
            @click="viewReservation(reservation)" 
            class="btn btn-secondary"
          >
            View Details
          </button>
          
          <button 
            v-if="canCancel(reservation)" 
            @click="cancelReservation(reservation)" 
            class="btn btn-danger"
            :disabled="cancellingId === reservation.id"
          >
            <span v-if="cancellingId === reservation.id">Cancelling...</span>
            <span v-else>Cancel Reservation</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal for reservation details -->
    <div v-if="selectedReservation" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Reservation Details</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="reservation-details">
            <div class="detail-section">
              <h3>Booking Information</h3>
              <div class="info-row">
                <span class="info-label">Confirmation Number:</span>
                <span class="info-value">{{ selectedReservation.confirmationNumber }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking Date:</span>
                <span class="info-value">{{ formatDate(selectedReservation.bookingDate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value status" :class="selectedReservation.status.toLowerCase()">
                  {{ selectedReservation.status }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Price:</span>
                <span class="info-value">${{ selectedReservation.totalPrice.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Flight Information</h3>
              <h4>Outbound Flight</h4>
              <div class="info-row">
                <span class="info-label">Flight Number:</span>
                <span class="info-value">{{ selectedReservation.outboundFlight.flightNumber }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">From:</span>
                <span class="info-value">{{ getAirportName(selectedReservation.outboundFlight.origin) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">To:</span>
                <span class="info-value">{{ getAirportName(selectedReservation.outboundFlight.destination) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Departure:</span>
                <span class="info-value">
                  {{ formatDate(selectedReservation.outboundFlight.departureTime) }}
                  {{ formatTime(selectedReservation.outboundFlight.departureTime) }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Arrival:</span>
                <span class="info-value">
                  {{ formatDate(selectedReservation.outboundFlight.arrivalTime) }}
                  {{ formatTime(selectedReservation.outboundFlight.arrivalTime) }}
                </span>
              </div>
              
              <div v-if="selectedReservation.returnFlight">
                <h4>Return Flight</h4>
                <div class="info-row">
                  <span class="info-label">Flight Number:</span>
                  <span class="info-value">{{ selectedReservation.returnFlight.flightNumber }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">From:</span>
                  <span class="info-value">{{ getAirportName(selectedReservation.returnFlight.origin) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">To:</span>
                  <span class="info-value">{{ getAirportName(selectedReservation.returnFlight.destination) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Departure:</span>
                  <span class="info-value">
                    {{ formatDate(selectedReservation.returnFlight.departureTime) }}
                    {{ formatTime(selectedReservation.returnFlight.departureTime) }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Arrival:</span>
                  <span class="info-value">
                    {{ formatDate(selectedReservation.returnFlight.arrivalTime) }}
                    {{ formatTime(selectedReservation.returnFlight.arrivalTime) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Passenger Information</h3>
              <div 
                v-for="(passenger, index) in selectedReservation.passengers" 
                :key="index"
                class="passenger-info"
              >
                <h4>Passenger {{ index + 1 }}</h4>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">{{ passenger.firstName }} {{ passenger.lastName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Passport/ID:</span>
                  <span class="info-value">{{ passenger.passportNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
          
          <button 
            v-if="canCancel(selectedReservation)" 
            @click="cancelReservation(selectedReservation)" 
            class="btn btn-danger"
            :disabled="cancellingId === selectedReservation.id"
          >
            <span v-if="cancellingId === selectedReservation.id">Cancelling...</span>
            <span v-else>Cancel Reservation</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getAirportName } from '../constants/airports';
import { formatTime, formatDate } from '../utils/formatters';

export default {
  name: 'MyReservations',
  setup() {
    const router = useRouter();
    const store = useStore();
    const selectedReservation = ref(null);
    const cancellingId = ref(null);
    
    // Computed properties from store
    const loading = computed(() => store.getters['reservations/isLoading']);
    const error = computed(() => store.getters['reservations/errorMessage']);
    const reservations = computed(() => store.getters['reservations/userReservations']);
    
    // Check if reservation can be cancelled (within 24 hours of booking)
    const canCancel = (reservation) => {
      if (reservation.status.toUpperCase() !== 'CONFIRMED') return false;
      
      const bookingDate = new Date(reservation.bookingDate);
      const departureDate = new Date(reservation.outboundFlight.departureTime);
      const now = new Date();
      
      // Can cancel if more than 24 hours until departure
      const hoursUntilDeparture = Math.floor((departureDate - now) / (1000 * 60 * 60));
      
      // Also check if booking was made within the last 24 hours (for immediate cancellation policy)
      const hoursSinceBooking = Math.floor((now - bookingDate) / (1000 * 60 * 60));
      
      // Can cancel if:
      // 1. More than 24 hours until departure OR
      // 2. Booking was made within the last 24 hours
      return hoursUntilDeparture > 24 || hoursSinceBooking <= 24;
    };
    
    // Fetch user's reservations
    const fetchReservations = async () => {
      try {
        // Check if user is authenticated
        if (!store.getters['auth/isAuthenticated']) {
          console.log('User not authenticated, redirecting to login');
          router.push({ 
            name: 'Login', 
            query: { redirect: router.currentRoute.value.fullPath }
          });
          return;
        }
        
        console.log('Fetching user reservations...');
        const result = await store.dispatch('reservations/getUserReservations');
        
        if (!result.success) {
          console.error('Failed to fetch reservations:', result.message);
        } else {
          const userReservations = store.getters['reservations/userReservations'];
          console.log('Successfully fetched reservations:', userReservations);
          
          // If no reservations, show empty state
          if (userReservations.length === 0) {
            console.log('No reservations found for user');
          }
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
      }
    };
    
    // View reservation details
    const viewReservation = (reservation) => {
      selectedReservation.value = reservation;
    };
    
    // Close the modal
    const closeModal = () => {
      selectedReservation.value = null;
    };
    
    // Cancel a reservation
    const cancelReservation = async (reservation) => {
      if (!canCancel(reservation)) return;
      
      if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
      }
      
      cancellingId.value = reservation.id;
      
      try {
        const result = await store.dispatch('reservations/cancelReservation', reservation.id);
        
        if (result.success) {
          // Close modal if the cancelled reservation is currently selected
          if (selectedReservation.value && selectedReservation.value.id === reservation.id) {
            selectedReservation.value = null;
          }
          
          // Show success message
          alert('Reservation has been cancelled successfully.');
        } else {
          alert('Failed to cancel reservation. Please try again.');
        }
      } catch (err) {
        console.error('Error cancelling reservation:', err);
        alert('Failed to cancel reservation. Please try again.');
      } finally {
        cancellingId.value = null;
      }
    };
    
    // Fetch reservations when the component mounts
    onMounted(() => {
      fetchReservations();
    });
    
    return {
      loading,
      error,
      reservations,
      selectedReservation,
      cancellingId,
      getAirportName,
      formatTime,
      formatDate,
      canCancel,
      fetchReservations,
      viewReservation,
      closeModal,
      cancelReservation
    };
  }
};
</script>

<style scoped>
.my-reservations {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.reservations-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.header-logo {
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 3px solid #4CAF50;
}

.my-reservations h1 {
  color: #2E7D32;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem 0;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.no-reservations {
  padding: 3rem 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #F1F8E9;
  border-radius: 8px;
  border: 1px solid #DCEDC8;
}

.empty-icon {
  font-size: 4rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #2E7D32;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #DCEDC8;
  transition: box-shadow 0.3s;
}

.reservation-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #DCEDC8;
}

.reservation-number {
  font-weight: bold;
  color: #2E7D32;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.reservation-date {
  color: #666;
  font-size: 0.9rem;
}

.reservation-status {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.reservation-status.confirmed {
  background-color: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.reservation-status.completed {
  background-color: #E3F2FD;
  color: #1565C0;
  border: 1px solid #90CAF9;
}

.reservation-status.cancelled {
  background-color: #FFEBEE;
  color: #C62828;
  border: 1px solid #EF9A9A;
}

.flight-summary {
  margin-bottom: 1.5rem;
}

.flight-info {
  background-color: #F1F8E9;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #DCEDC8;
}

.flight-info.return-flight {
  margin-top: 0.5rem;
  border-left: 4px solid #4CAF50;
}

.flight-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.route-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 45%;
}

.route-arrow {
  font-size: 1.5rem;
  color: #4CAF50;
}

.city {
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #2E7D32;
}

.time {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.date {
  font-size: 0.9rem;
  color: #666;
}

.flight-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #DCEDC8;
}

.flight-number {
  font-weight: bold;
  color: #2E7D32;
}

.passengers {
  color: #666;
  font-size: 0.9rem;
}

.reservation-actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #388E3C;
}

.btn-secondary {
  background-color: #616161;
  color: white;
}

.btn-secondary:hover {
  background-color: #424242;
}

.btn-danger {
  background-color: #E53935;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #C62828;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DCEDC8;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #DCEDC8;
  background-color: #F1F8E9;
}

.modal-header h2 {
  color: #2E7D32;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #2E7D32;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #388E3C;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid #DCEDC8;
  background-color: #F9FBF9;
}

.reservation-details .detail-section {
  margin-bottom: 2rem;
}

.reservation-details h3 {
  color: #2E7D32;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 1px solid #DCEDC8;
  padding-bottom: 0.5rem;
}

.reservation-details h4 {
  color: #2E7D32;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-label {
  width: 140px;
  font-weight: bold;
  color: #666;
}

.info-value {
  flex-grow: 1;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.status.confirmed {
  background-color: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.status.completed {
  background-color: #E3F2FD;
  color: #1565C0;
  border: 1px solid #90CAF9;
}

.status.cancelled {
  background-color: #FFEBEE;
  color: #C62828;
  border: 1px solid #EF9A9A;
}

.passenger-info {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .reservation-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .reservation-status {
    margin-top: 0.75rem;
  }
  
  .flight-route {
    flex-direction: column;
    gap: 1rem;
  }
  
  .route-item {
    width: 100%;
  }
  
  .route-arrow {
    transform: rotate(90deg);
  }
  
  .reservation-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .reservation-actions button {
    width: 100%;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .info-label {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-footer button {
    width: 100%;
  }
}
</style> 