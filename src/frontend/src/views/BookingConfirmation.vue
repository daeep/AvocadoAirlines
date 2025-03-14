<template>
  <div class="confirmation-page">
    <div class="confirmation-container">
      <div class="confirmation-header">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Booking Confirmed!</h1>
        <p class="confirmation-number">Confirmation Number: <span>{{ bookingDetails.bookingId }}</span></p>
        <p class="confirmation-date">Booked on {{ formatDate(bookingDetails.createdAt) }}</p>
      </div>
      
      <div class="booking-details">
        <h2>Flight Details</h2>
        
        <div class="flight-card">
          <div class="flight-header">
            <span class="flight-label">Outbound Flight</span>
            <span class="flight-number">{{ bookingDetails.outboundFlight.flight_number }}</span>
          </div>
          
          <div class="flight-details">
            <div class="flight-route">
              <div class="route-item">
                <span class="city">{{ getAirportName(bookingDetails.outboundFlight.origin) }}</span>
                <span class="time">{{ formatTime(bookingDetails.outboundFlight.departure_time) }}</span>
                <span class="date">{{ formatDate(bookingDetails.outboundFlight.departure_time) }}</span>
              </div>
              
              <div class="route-arrow">→</div>
              
              <div class="route-item">
                <span class="city">{{ getAirportName(bookingDetails.outboundFlight.destination) }}</span>
                <span class="time">{{ formatTime(bookingDetails.outboundFlight.arrival_time) }}</span>
                <span class="date">{{ formatDate(bookingDetails.outboundFlight.arrival_time) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="bookingDetails.returnFlight" class="flight-card">
          <div class="flight-header">
            <span class="flight-label">Return Flight</span>
            <span class="flight-number">{{ bookingDetails.returnFlight.flight_number }}</span>
          </div>
          
          <div class="flight-details">
            <div class="flight-route">
              <div class="route-item">
                <span class="city">{{ getAirportName(bookingDetails.returnFlight.origin) }}</span>
                <span class="time">{{ formatTime(bookingDetails.returnFlight.departure_time) }}</span>
                <span class="date">{{ formatDate(bookingDetails.returnFlight.departure_time) }}</span>
              </div>
              
              <div class="route-arrow">→</div>
              
              <div class="route-item">
                <span class="city">{{ getAirportName(bookingDetails.returnFlight.destination) }}</span>
                <span class="time">{{ formatTime(bookingDetails.returnFlight.arrival_time) }}</span>
                <span class="date">{{ formatDate(bookingDetails.returnFlight.arrival_time) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="passenger-details">
          <h2>Passenger Information</h2>
          
          <div class="passenger-list">
            <div 
              v-for="(passenger, index) in bookingDetails.passengers" 
              :key="index"
              class="passenger-card"
            >
              <h3>Passenger {{ index + 1 }}</h3>
              <div class="passenger-info">
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
        
        <div class="payment-details">
          <h2>Payment Information</h2>
          
          <div class="payment-card">
            <div class="info-row">
              <span class="info-label">Card:</span>
              <span class="info-value">•••• •••• •••• {{ bookingDetails.payment.lastFourDigits }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cardholder:</span>
              <span class="info-value">{{ bookingDetails.payment.cardholderName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Amount:</span>
              <span class="info-value price">${{ formatPrice(bookingDetails.totalPrice) }}</span>
            </div>
          </div>
        </div>
        
        <div class="contact-details">
          <h2>Contact Information</h2>
          
          <div class="contact-card">
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ bookingDetails.contactInfo.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">{{ bookingDetails.contactInfo.phone }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="confirmation-actions">
        <button @click="downloadConfirmation" class="btn btn-primary">
          <i class="fas fa-download"></i> Download Confirmation
        </button>
        <button @click="goToHome" class="btn btn-secondary">Back to Home</button>
      </div>
      
      <div class="additional-info">
        <h3>Important Information</h3>
        <ul>
          <li>Please arrive at the airport at least 2 hours before your flight's departure time.</li>
          <li>Don't forget to bring a valid photo ID or passport for all passengers.</li>
          <li>Check-in opens 24 hours before your flight's departure time.</li>
          <li>A confirmation email has been sent to your registered email address.</li>
          <li>For any changes or cancellations, please contact our customer service.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAirportName } from '../constants/airports';
import { formatTime, formatPrice, formatDate, calculateDuration } from '../utils/formatters';

export default {
  name: 'BookingConfirmation',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const loading = ref(true);
    const error = ref('');
    // Initialize bookingDetails with default values to prevent null reference errors
    const bookingDetails = ref({
      bookingId: 'Unknown',
      status: 'Unknown',
      createdAt: new Date().toISOString(),
      passengers: [],
      outboundFlight: {},
      returnFlight: null,
      totalPrice: 0,
      payment: { lastFourDigits: '', cardholderName: '' },
      contactInfo: { email: '', phone: '' }
    });
    
    // Fetch booking details
    const fetchBookingDetails = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // Get confirmation data from sessionStorage
        const confirmationData = JSON.parse(sessionStorage.getItem('confirmationData'));
        
        if (!confirmationData) {
          throw new Error('Booking details not found');
        }
        
        // Set booking details from sessionStorage
        bookingDetails.value = {
          bookingId: confirmationData.confirmationNumber || route.params.reservationId,
          status: 'Confirmed',
          createdAt: confirmationData.paymentDate || new Date().toISOString(),
          passengers: confirmationData.passengers || [],
          outboundFlight: confirmationData.outboundFlight || {},
          returnFlight: confirmationData.returnFlight || null,
          totalPrice: confirmationData.totalPrice || 0,
          payment: confirmationData.payment || {},
          contactInfo: confirmationData.contactInfo || {}
        };
        
        console.log('Loaded booking details:', bookingDetails.value);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        error.value = 'Failed to load booking details. Please try again.';
        
        // Keep the default values already set in bookingDetails.value
      } finally {
        loading.value = false;
      }
    };
    
    // Download confirmation as text
    const downloadConfirmation = () => {
      try {
        // Create text content for the confirmation
        const content = `
BOOKING CONFIRMATION
====================

Confirmation Number: ${bookingDetails.value.bookingId}
Booking Date: ${formatDate(bookingDetails.value.createdAt)}
Status: ${bookingDetails.value.status}

FLIGHT DETAILS
-------------
Outbound Flight: ${bookingDetails.value.outboundFlight.flight_number || 'N/A'}
From: ${getAirportName(bookingDetails.value.outboundFlight.origin) || 'N/A'}
To: ${getAirportName(bookingDetails.value.outboundFlight.destination) || 'N/A'}
Departure: ${formatDate(bookingDetails.value.outboundFlight.departure_time)} ${formatTime(bookingDetails.value.outboundFlight.departure_time) || 'N/A'}
Arrival: ${formatDate(bookingDetails.value.outboundFlight.arrival_time)} ${formatTime(bookingDetails.value.outboundFlight.arrival_time) || 'N/A'}

${bookingDetails.value.returnFlight ? `
Return Flight: ${bookingDetails.value.returnFlight.flight_number || 'N/A'}
From: ${getAirportName(bookingDetails.value.returnFlight.origin) || 'N/A'}
To: ${getAirportName(bookingDetails.value.returnFlight.destination) || 'N/A'}
Departure: ${formatDate(bookingDetails.value.returnFlight.departure_time)} ${formatTime(bookingDetails.value.returnFlight.departure_time) || 'N/A'}
Arrival: ${formatDate(bookingDetails.value.returnFlight.arrival_time)} ${formatTime(bookingDetails.value.returnFlight.arrival_time) || 'N/A'}
` : ''}

PASSENGER INFORMATION
--------------------
${bookingDetails.value.passengers.map((p, i) => `
Passenger ${i + 1}:
Name: ${p.firstName} ${p.lastName}
Passport/ID: ${p.passportNumber}
`).join('')}

PAYMENT INFORMATION
------------------
Card: •••• •••• •••• ${bookingDetails.value.payment.lastFourDigits || 'N/A'}
Cardholder: ${bookingDetails.value.payment.cardholderName || 'N/A'}
Total Amount: $${formatPrice(bookingDetails.value.totalPrice)}

CONTACT INFORMATION
-----------------
Email: ${bookingDetails.value.contactInfo.email || 'N/A'}
Phone: ${bookingDetails.value.contactInfo.phone || 'N/A'}

IMPORTANT INFORMATION
-------------------
- Please arrive at the airport at least 2 hours before your flight's departure time.
- Don't forget to bring a valid photo ID or passport for all passengers.
- Check-in opens 24 hours before your flight's departure time.
- For any changes or cancellations, please contact our customer service.

Thank you for choosing WebTours!
`;

        // Create a blob and download link
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-confirmation-${bookingDetails.value.bookingId}.txt`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (err) {
        console.error('Error downloading confirmation:', err);
        alert('Failed to download confirmation. Please try again.');
      }
    };
    
    // Return to home page
    const goToHome = () => {
      router.push({ name: 'Home' });
    };
    
    // Initialize component
    onMounted(() => {
      fetchBookingDetails();
    });
    
    return {
      loading,
      error,
      bookingDetails,
      getAirportName,
      formatTime,
      formatDate,
      calculateDuration,
      formatPrice,
      goToHome,
      downloadConfirmation
    };
  }
};
</script>

<style scoped>
.confirmation-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.confirmation-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.confirmation-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.confirmation-header h1 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.confirmation-number {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.confirmation-number span {
  font-weight: bold;
  color: #4CAF50;
}

.confirmation-date {
  color: #666;
  font-size: 0.9rem;
}

.booking-details {
  margin-bottom: 2rem;
}

.booking-details h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.flight-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.flight-label {
  color: #666;
  font-size: 0.9rem;
}

.flight-number {
  font-weight: bold;
  color: #4CAF50;
}

.flight-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.time {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.date {
  font-size: 0.9rem;
  color: #666;
}

.passenger-list, .payment-card, .contact-card {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.passenger-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.passenger-card h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.passenger-info, .payment-card, .contact-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-label {
  width: 120px;
  font-weight: bold;
  color: #666;
}

.info-value {
  flex-grow: 1;
}

.price {
  font-weight: bold;
  color: #4CAF50;
}

.confirmation-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #2E7D32;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.additional-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.additional-info h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.additional-info ul {
  padding-left: 1.5rem;
}

.additional-info li {
  margin-bottom: 0.5rem;
  color: #333;
}

@media (max-width: 768px) {
  .confirmation-container {
    padding: 1.5rem;
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
  
  .confirmation-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .confirmation-actions button {
    width: 100%;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .info-label {
    width: 100%;
    margin-bottom: 0.25rem;
  }
}
</style> 