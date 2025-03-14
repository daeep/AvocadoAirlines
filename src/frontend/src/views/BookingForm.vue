<template>
  <div class="booking-form">
    <div class="booking-header">
      <div class="logo-container">
        <img src="/images/logo.jpg" alt="Avocado Air Logo" class="booking-logo">
      </div>
      <h1>{{ $t('booking.passengerDetails') }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="goBack" class="btn btn-primary">{{ $t('common.back') }}</button>
    </div>
    
    <div v-else>
      <div class="booking-summary">
        <h2>{{ $t('booking.summary') }}</h2>
        
        <div class="flight-summary">
          <div class="flight-card">
            <div class="flight-header">
              <span class="flight-label">{{ $t('flights.outbound') }}</span>
              <span class="flight-number">{{ outboundFlight.flight_number }}</span>
            </div>
            
            <div class="flight-details">
              <div class="flight-route">
                <div class="route-item">
                  <span class="city">{{ getAirportName(outboundFlight.origin) }}</span>
                  <span class="time">{{ formatTime(outboundFlight.departure_time) }}</span>
                  <span class="date">{{ formatDate(outboundFlight.departure_time) }}</span>
                </div>
                
                <div class="route-arrow">→</div>
                
                <div class="route-item">
                  <span class="city">{{ getAirportName(outboundFlight.destination) }}</span>
                  <span class="time">{{ formatTime(outboundFlight.arrival_time) }}</span>
                  <span class="date">{{ formatDate(outboundFlight.arrival_time) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="returnFlight" class="flight-card">
            <div class="flight-header">
              <span class="flight-label">{{ $t('flights.return') }}</span>
              <span class="flight-number">{{ returnFlight.flight_number }}</span>
            </div>
            
            <div class="flight-details">
              <div class="flight-route">
                <div class="route-item">
                  <span class="city">{{ getAirportName(returnFlight.origin) }}</span>
                  <span class="time">{{ formatTime(returnFlight.departure_time) }}</span>
                  <span class="date">{{ formatDate(returnFlight.departure_time) }}</span>
                </div>
                
                <div class="route-arrow">→</div>
                
                <div class="route-item">
                  <span class="city">{{ getAirportName(returnFlight.destination) }}</span>
                  <span class="time">{{ formatTime(returnFlight.arrival_time) }}</span>
                  <span class="date">{{ formatDate(returnFlight.arrival_time) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="price-summary">
            <div class="price-row">
              <span>{{ $t('search.passengers') }}:</span>
              <span>{{ passengers }}</span>
            </div>
            <div class="price-row">
              <span>{{ $t('booking.pricePerPassenger') }}:</span>
              <span>${{ typeof calculatePricePerPassenger() === 'number' ? calculatePricePerPassenger().toFixed(2) : '0.00' }}</span>
            </div>
            <div class="price-row total">
              <span>{{ $t('booking.total') }}:</span>
              <span>${{ typeof calculateTotalPrice() === 'number' ? calculateTotalPrice().toFixed(2) : '0.00' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="passenger-forms">
        <h2>{{ $t('booking.passengerDetails') }}</h2>
        <p class="form-info">{{ $t('booking.provideDetails') }}</p>
        
        <div 
          v-for="(passenger, index) in passengerForms" 
          :key="index"
          class="passenger-form"
        >
          <h3>{{ $t('booking.passenger') }} {{ index + 1 }}</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="`firstName-${index}`">{{ $t('booking.firstName') }}</label>
              <input 
                :id="`firstName-${index}`"
                type="text" 
                v-model="passenger.firstName" 
                required 
                class="form-control"
                :placeholder="$t('booking.firstName')"
              />
            </div>
            
            <div class="form-group">
              <label :for="`lastName-${index}`">{{ $t('booking.lastName') }}</label>
              <input 
                :id="`lastName-${index}`"
                type="text" 
                v-model="passenger.lastName" 
                required 
                class="form-control"
                :placeholder="$t('booking.lastName')"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="`dob-${index}`">{{ $t('booking.dateOfBirth') }}</label>
              <div class="date-picker-container">
                <input 
                  :id="`dob-${index}`" 
                  v-model="passenger.dob" 
                  required 
                  class="form-control date-picker"
                  readonly
                  @click="showDobPicker(index)"
                />
                <div v-if="activeDobPickerIndex === index" class="date-picker-popup">
                  <div class="date-picker-header">
                    <button type="button" @click="previousMonth">&lt;</button>
                    <span>{{ currentMonthYear }}</span>
                    <button type="button" @click="nextMonth">&gt;</button>
                  </div>
                  <div class="date-picker-grid">
                    <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
                    <div 
                      v-for="date in calendarDays" 
                      :key="date.date"
                      :class="['calendar-day', {
                        'other-month': !date.currentMonth,
                        'selected': isSelectedDate(date.date, index),
                        'disabled': isDateDisabled(date.date, true)
                      }]"
                      @click="selectDate(date.date, 'dob', index)"
                    >
                      {{ date.day }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label :for="`nationality-${index}`">{{ $t('booking.nationality') }}</label>
              <input 
                :id="`nationality-${index}`"
                type="text" 
                v-model="passenger.nationality" 
                required 
                class="form-control"
                :placeholder="$t('booking.nationality')"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="`passportNumber-${index}`">{{ $t('booking.passportNumber') }}</label>
              <input 
                :id="`passportNumber-${index}`"
                type="text" 
                v-model="passenger.passportNumber" 
                required 
                class="form-control"
                :placeholder="$t('booking.passportNumber')"
              />
            </div>
            
            <div class="form-group">
              <label :for="`passportExpiry-${index}`">{{ $t('booking.passportExpiry') }}</label>
              <div class="date-picker-container">
                <input 
                  :id="`passportExpiry-${index}`"
                  type="text" 
                  v-model="passenger.passportExpiry" 
                  required 
                  class="form-control date-picker"
                  readonly
                  @click="showPassportExpiryPicker(index)"
                />
                <div v-if="activePassportExpiryPickerIndex === index" class="date-picker-popup">
                  <div class="date-picker-header">
                    <button type="button" @click="previousMonth">&lt;</button>
                    <span>{{ currentMonthYear }}</span>
                    <button type="button" @click="nextMonth">&gt;</button>
                  </div>
                  <div class="date-picker-grid">
                    <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
                    <div 
                      v-for="date in calendarDays" 
                      :key="date.date"
                      :class="['calendar-day', {
                        'other-month': !date.currentMonth,
                        'selected': isSelectedPassportExpiryDate(date.date, index),
                        'disabled': isDateDisabled(date.date, false)
                      }]"
                      @click="selectDate(date.date, 'passportExpiry', index)"
                    >
                      {{ date.day }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-divider" v-if="index < passengerForms.length - 1"></div>
        </div>
        
        <div class="contact-details">
          <h3>{{ $t('booking.contactInfo') }}</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">{{ $t('booking.email') }}</label>
              <input 
                id="email"
                type="email" 
                v-model="contactInfo.email" 
                required 
                class="form-control"
                :placeholder="$t('booking.emailPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label for="phone">{{ $t('booking.phone') }}</label>
              <input 
                id="phone"
                type="tel" 
                v-model="contactInfo.phone" 
                required 
                class="form-control"
                :placeholder="$t('booking.phonePlaceholder')"
              />
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button @click="goBack" class="btn btn-secondary">{{ $t('common.back') }}</button>
          <button @click="proceedToPayment" class="btn btn-primary" :disabled="isSubmitDisabled">
            {{ $t('booking.continueToPayment') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../utils/api';

export default {
  name: 'BookingForm',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { locale } = useI18n();
    
    const flightId = route.params.flightId;
    const returnFlightId = route.query.returnFlightId;
    const passengers = parseInt(route.query.passengers || '1');
    
    const loading = ref(true);
    const error = ref('');
    const outboundFlight = ref({});
    const returnFlight = ref(null);
    
    // Initialize passenger forms based on number of passengers
    const passengerForms = ref([]);
    
    const contactInfo = reactive({
      email: '',
      phone: ''
    });
    
    // Date picker state
    const currentDate = ref(new Date());
    const activeDobPickerIndex = ref(null);
    const activePassportExpiryPickerIndex = ref(null);
    
    // Airport code to name mapping
    const airports = {
      'LAX': 'Los Angeles',
      'JFK': 'New York',
      'ORD': 'Chicago',
      'MIA': 'Miami',
      'SFO': 'San Francisco',
      'ATL': 'Atlanta',
      'BOS': 'Boston',
      'DFW': 'Dallas',
      'DEN': 'Denver',
      'SEA': 'Seattle'
    };
    
    // Date picker functions
    const weekDays = computed(() => {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    });
    
    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleString(locale.value, { month: 'long', year: 'numeric' });
    });
    
    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];
      
      // Add days from previous month
      const firstDayWeekday = firstDay.getDay();
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          currentMonth: false
        });
      }
      
      // Add days from current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date: date.toISOString().split('T')[0],
          day: i,
          currentMonth: true
        });
      }
      
      // Add days from next month
      const remainingDays = 42 - days.length; // 6 weeks * 7 days = 42
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          currentMonth: false
        });
      }
      
      return days;
    });
    
    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
    };
    
    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
    };
    
    const showDobPicker = (index) => {
      activeDobPickerIndex.value = index;
    };
    
    const showPassportExpiryPicker = (index) => {
      activePassportExpiryPickerIndex.value = index;
    };
    
    const isSelectedDate = (date, index) => {
      return date === passengerForms.value[index].dob;
    };
    
    const isSelectedPassportExpiryDate = (date, index) => {
      return date === passengerForms.value[index].passportExpiry;
    };
    
    const isDateDisabled = (date, isPast) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isPast) {
        // For DOB, future dates are disabled
        return selectedDate > today;
      } else {
        // For other date pickers, past dates might be disabled
        return selectedDate < today;
      }
    };
    
    const selectDate = (date, type, index) => {
      if (type === 'dob') {
        passengerForms.value[index].dob = date;
        activeDobPickerIndex.value = null;
      } else if (type === 'passportExpiry') {
        passengerForms.value[index].passportExpiry = date;
        activePassportExpiryPickerIndex.value = null;
      }
    };
    
    // Get the airport name from code
    const getAirportName = (code) => {
      return `${airports[code] || code} (${code})`;
    };
    
    // Format time for display (e.g., "8:30 AM")
    const formatTime = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
    
    // Format date (e.g., "Dec 1, 2023")
    const formatDate = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    // Calculate price per passenger
    const calculatePricePerPassenger = () => {
      let price = 0;
      
      if (outboundFlight.value && typeof outboundFlight.value.price === 'number') {
        price += outboundFlight.value.price;
      } else if (outboundFlight.value && typeof outboundFlight.value.price === 'string') {
        // Handle case where price might be a string
        price += parseFloat(outboundFlight.value.price) || 0;
      }
      
      if (returnFlight.value && typeof returnFlight.value.price === 'number') {
        price += returnFlight.value.price;
      } else if (returnFlight.value && typeof returnFlight.value.price === 'string') {
        // Handle case where price might be a string
        price += parseFloat(returnFlight.value.price) || 0;
      }
      
      return price;
    };
    
    // Calculate total price
    const calculateTotalPrice = () => {
      const pricePerPassenger = calculatePricePerPassenger();
      const totalPassengers = typeof passengers === 'number' ? passengers : parseInt(passengers) || 1;
      return pricePerPassenger * totalPassengers;
    };
    
    // Check if form is complete
    const isSubmitDisabled = computed(() => {
      // Check if all passenger forms are filled
      const passengersComplete = passengerForms.value.every(p => 
        p.firstName && 
        p.lastName && 
        p.dob && 
        p.nationality && 
        p.passportNumber && 
        p.passportExpiry
      );
      
      // Check if contact info is filled
      const contactComplete = contactInfo.email && contactInfo.phone;
      
      return !(passengersComplete && contactComplete);
    });
    
    // Go back to flight results
    const goBack = () => {
      router.back();
    };
    
    // Proceed to payment
    const proceedToPayment = () => {
      // Generate a temporary reservation ID (in a real app, this would come from the backend)
      const tempReservationId = Math.random().toString(36).substring(2, 15);
      
      // Store booking data in sessionStorage
      const bookingData = {
        reservationId: tempReservationId,
        outboundFlightId: flightId,
        returnFlightId: returnFlightId,
        passengers: passengerForms.value,
        contactInfo: contactInfo,
        totalPrice: calculateTotalPrice(),
        // Store the actual flight objects for the confirmation page
        outboundFlight: outboundFlight.value,
        returnFlight: returnFlight.value
      };
      
      console.log('Storing booking data:', bookingData);
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
      
      // Navigate to payment page
      router.push({
        name: 'PaymentForm',
        params: { reservationId: tempReservationId },
        query: { 
          amount: calculateTotalPrice().toFixed(2)
        }
      });
    };
    
    // Load flight data
    const loadFlightData = async () => {
      try {
        loading.value = true;
        
        // Fetch outbound flight
        const response = await api.get(`/api/flights/${flightId}`);
        outboundFlight.value = response.data;
        
        // Fetch return flight if applicable
        if (returnFlightId) {
          const returnResponse = await api.get(`/api/flights/${returnFlightId}`);
          returnFlight.value = returnResponse.data;
        }
        
        // Initialize passenger forms
        for (let i = 0; i < passengers; i++) {
          passengerForms.value.push({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            passportNumber: '',
            seatPreference: 'window'
          });
        }
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading flight data:', err);
        error.value = 'Failed to load flight data. Please try again.';
        loading.value = false;
      }
    };
    
    // Fetch data when the component is mounted
    onMounted(() => {
      loadFlightData();
    });
    
    return {
      passengers,
      loading,
      error,
      outboundFlight,
      returnFlight,
      passengerForms,
      contactInfo,
      isSubmitDisabled,
      getAirportName,
      formatTime,
      formatDate,
      calculatePricePerPassenger,
      calculateTotalPrice,
      goBack,
      proceedToPayment,
      currentDate,
      activeDobPickerIndex,
      activePassportExpiryPickerIndex,
      weekDays,
      currentMonthYear,
      calendarDays,
      previousMonth,
      nextMonth,
      showDobPicker,
      showPassportExpiryPicker,
      isSelectedDate,
      isSelectedPassportExpiryDate,
      isDateDisabled,
      selectDate
    };
  }
};
</script>

<style scoped>
.booking-form {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.booking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  margin-bottom: 1rem;
}

.booking-logo {
  width: 120px;
  height: auto;
  border-radius: 50%;
  border: 3px solid #17b978;
}

.booking-form h1, .booking-form h2, .booking-form h3 {
  color: #118c5b;
  margin-bottom: 1.5rem;
}

.booking-form h1 {
  margin-top: 0;
}

.booking-form h2 {
  font-size: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.booking-form h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #17b978;
}

.booking-form h3 {
  font-size: 1.25rem;
}

.form-info {
  margin-bottom: 1.5rem;
  color: #666;
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
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.booking-summary {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e6e6e6;
}

.flight-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.flight-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border: 1px solid #e6e6e6;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e6e6e6;
}

.flight-label {
  font-weight: bold;
  color: #118c5b;
}

.flight-number {
  font-weight: bold;
  color: #17b978;
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
  color: #17b978;
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

.price-summary {
  background-color: #f0f9f4;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e6e6e6;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e6e6e6;
}

.price-row.total {
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  border-top: 1px dashed #e6e6e6;
  border-bottom: none;
  padding-top: 1rem;
  color: #17b978;
}

.passenger-forms {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  border: 1px solid #e6e6e6;
}

.passenger-form {
  margin-bottom: 2rem;
}

.form-divider {
  height: 1px;
  background-color: #e6e6e6;
  margin: 2rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #118c5b;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #17b978;
  outline: none;
  box-shadow: 0 0 0 3px rgba(23, 185, 120, 0.1);
}

.date-picker-container {
  position: relative;
}

.date-picker {
  cursor: pointer;
  background-color: white;
}

.date-picker-popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background-color: white;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  width: 300px;
  margin-top: 0.5rem;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.date-picker-header button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #4CAF50;
}

.date-picker-header button:hover {
  color: #2E7D32;
}

.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #4CAF50;
  padding: 0.5rem;
}

.calendar-day {
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.calendar-day:hover:not(.disabled) {
  background-color: #e6e6e6;
}

.calendar-day.selected {
  background-color: #4CAF50;
  color: white;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.contact-details {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e6e6e6;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #17b978;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #118c5b;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.btn-secondary {
  background-color: #4de9aa;
  color: #118c5b;
}

.btn-secondary:hover {
  background-color: #20e395;
}

@media (max-width: 768px) {
  .booking-form {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
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
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style> 