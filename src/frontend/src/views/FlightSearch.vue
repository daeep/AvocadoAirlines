<template>
  <div class="flight-search">
    <h1>{{ $t('flightSearch.title') }}</h1>
    
    <form @submit.prevent="searchFlights" class="search-form">
      <div class="form-row">
        <div class="form-group">
          <label for="origin">{{ $t('flightSearch.origin') }}</label>
          <select id="origin" v-model="searchParams.origin" required class="form-control">
            <option value="">{{ $t('flightSearch.selectOrigin') }}</option>
            <option v-for="airport in airports" :key="airport.code" :value="airport.code">
              {{ airport.name }} ({{ airport.code }})
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="destination">{{ $t('flightSearch.destination') }}</label>
          <select id="destination" v-model="searchParams.destination" required class="form-control">
            <option value="">{{ $t('flightSearch.selectDestination') }}</option>
            <option v-for="airport in airports" :key="airport.code" :value="airport.code">
              {{ airport.name }} ({{ airport.code }})
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="departureDate">{{ $t('flightSearch.departureDate') }}</label>
          <div class="date-picker-container">
            <input 
              type="text" 
              id="departureDate" 
              v-model="searchParams.departureDate" 
              required 
              :min="minDate"
              class="form-control date-picker"
              readonly
              @click="showDeparturePicker = true"
            />
            <div v-if="showDeparturePicker" class="date-picker-popup">
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
                    'selected': isSelectedDate(date.date),
                    'disabled': isDateDisabled(date.date)
                  }]"
                  @click="selectDate(date.date, 'departure')"
                >
                  {{ date.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group checkbox-group">
          <div class="return-flight-checkbox">
            <input 
              type="checkbox" 
              id="returnFlightCheckbox" 
              v-model="isReturnFlight"
              class="checkbox-input"
            />
            <label for="returnFlightCheckbox">{{ $t('flightSearch.returnFlight') }}</label>
          </div>
        </div>
      </div>
      
      <div class="form-row" v-if="isReturnFlight">
        <div class="form-group full-width">
          <label for="returnDate">{{ $t('flightSearch.returnDate') }}</label>
          <div class="date-picker-container">
            <input 
              type="text" 
              id="returnDate" 
              v-model="searchParams.returnDate" 
              required
              :min="searchParams.departureDate || minDate"
              class="form-control date-picker"
              readonly
              @click="showReturnPicker = true"
            />
            <div v-if="showReturnPicker" class="date-picker-popup">
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
                    'selected': isSelectedDate(date.date),
                    'disabled': isDateDisabled(date.date)
                  }]"
                  @click="selectDate(date.date, 'return')"
                >
                  {{ date.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="passengers">{{ $t('flightSearch.passengers') }}</label>
          <select id="passengers" v-model="searchParams.passengers" required class="form-control">
            <option v-for="n in 9" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">{{ $t('flightSearch.searching') }}</span>
          <span v-else>{{ $t('flightSearch.search') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../utils/api';

export default {
  name: 'FlightSearch',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t, locale } = useI18n();
    
    const searchParams = ref({
      origin: route.query.origin || '',
      destination: route.query.destination || '',
      departureDate: route.query.departureDate || '',
      returnDate: route.query.returnDate || '',
      passengers: route.query.passengers || '1'
    });
    
    const isReturnFlight = ref(!!route.query.returnDate);
    const loading = ref(false);
    const airports = ref([]);
    const showDeparturePicker = ref(false);
    const showReturnPicker = ref(false);
    const currentDate = ref(new Date());
    
    // Watch for route query changes
    watch(() => route.query, (newQuery) => {
      if (newQuery.origin) searchParams.value.origin = newQuery.origin;
      if (newQuery.destination) searchParams.value.destination = newQuery.destination;
      if (newQuery.departureDate) searchParams.value.departureDate = newQuery.departureDate;
      if (newQuery.returnDate) {
        searchParams.value.returnDate = newQuery.returnDate;
        isReturnFlight.value = true;
      }
      if (newQuery.passengers) searchParams.value.passengers = newQuery.passengers;
    }, { immediate: true });
    
    // Watch for changes to isReturnFlight
    watch(isReturnFlight, (newValue) => {
      if (!newValue) {
        searchParams.value.returnDate = '';
      }
    });
    
    // Watch for locale changes to update airport names
    watch(locale, async () => {
      await fetchAirports();
    });
    
    // Get minimum date (today) for date inputs
    const minDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    
    // Calendar helpers
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
    
    // Calendar methods
    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
    };
    
    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
    };
    
    const isSelectedDate = (date) => {
      return date === searchParams.value.departureDate || date === searchParams.value.returnDate;
    };
    
    const isDateDisabled = (date) => {
      const selectedDate = new Date(date);
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      
      if (searchParams.value.departureDate && showReturnPicker.value) {
        const departureDate = new Date(searchParams.value.departureDate);
        return selectedDate < departureDate;
      }
      
      return selectedDate < minDate;
    };
    
    const selectDate = (date, type) => {
      if (type === 'departure') {
        searchParams.value.departureDate = date;
        showDeparturePicker.value = false;
      } else {
        searchParams.value.returnDate = date;
        showReturnPicker.value = false;
      }
    };
    
    // Fetch airports with translations
    const fetchAirports = async () => {
      try {
        const response = await api.get('/api/airports', {
          params: { language: locale.value }
        });
        airports.value = response.data;
        
        // If origin/destination are set from URL but airport list is empty,
        // make sure we've loaded airports before proceeding
        if ((searchParams.value.origin || searchParams.value.destination) && 
            airports.value.length > 0) {
          // Validate that the airports from the URL exist in our list
          const originExists = airports.value.some(airport => airport.code === searchParams.value.origin);
          const destinationExists = airports.value.some(airport => airport.code === searchParams.value.destination);
          
          // If not found, set to the first airport in the list
          if (searchParams.value.origin && !originExists && airports.value.length > 0) {
            searchParams.value.origin = airports.value[0].code;
          }
          
          if (searchParams.value.destination && !destinationExists && airports.value.length > 0) {
            searchParams.value.destination = airports.value[0].code;
          }
        }
      } catch (error) {
        console.error('Error fetching airports:', error);
      }
    };
    
    const searchFlights = () => {
      if (searchParams.value.origin === searchParams.value.destination) {
        alert(t('flightSearch.sameAirportError'));
        return;
      }
      
      if (isReturnFlight.value && !searchParams.value.returnDate) {
        alert(t('flightSearch.returnDateRequired'));
        return;
      }
      
      loading.value = true;
      
      router.push({
        name: 'FlightResults',
        query: {
          origin: searchParams.value.origin,
          destination: searchParams.value.destination,
          departureDate: searchParams.value.departureDate,
          returnDate: searchParams.value.returnDate,
          passengers: searchParams.value.passengers
        }
      });
      
      loading.value = false;
    };
    
    // Initialize
    onMounted(async () => {
      await fetchAirports();
      
      // If we have query parameters but no airports, retry airport fetch
      if ((route.query.origin || route.query.destination) && airports.value.length === 0) {
        await fetchAirports();
      }
      
      // Parse date in MM/DD/YYYY format if provided
      if (searchParams.value.departureDate && searchParams.value.departureDate.includes('/')) {
        const [month, day, year] = searchParams.value.departureDate.split('/');
        searchParams.value.departureDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      if (searchParams.value.returnDate && searchParams.value.returnDate.includes('/')) {
        const [month, day, year] = searchParams.value.returnDate.split('/');
        searchParams.value.returnDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // If dates are provided, set the calendar to the month of the departure date
      if (searchParams.value.departureDate) {
        currentDate.value = new Date(searchParams.value.departureDate);
      }
    });
    
    return {
      searchParams,
      isReturnFlight,
      loading,
      minDate,
      airports,
      showDeparturePicker,
      showReturnPicker,
      currentMonthYear,
      weekDays,
      calendarDays,
      previousMonth,
      nextMonth,
      isSelectedDate,
      isDateDisabled,
      selectDate,
      searchFlights
    };
  }
};
</script>

<style scoped>
.flight-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.flight-search h1 {
  color: #118c5b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #118c5b;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 2rem;
}

.return-flight-checkbox {
  display: flex;
  align-items: center;
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
  color: #17b978;
}

.date-picker-header button:hover {
  color: #20e395;
}

.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #118c5b;
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
  background-color: #17b978;
  color: white;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.disabled {
  color: #ccc;
  cursor: not-allowed;
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

.btn-primary {
  background-color: #17b978;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background-color: #118c5b;
}

.btn-primary:disabled {
  background-color: #e6e6e6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-group.full-width {
    grid-column: auto;
  }
  
  .checkbox-group {
    margin-top: 0;
  }
  
  .date-picker-popup {
    width: calc(100vw - 2rem);
    left: -50%;
    transform: translateX(25%);
  }
}

@media (max-width: 480px) {
  .search-form {
    padding: 1.5rem;
  }
  
  .flight-search h1 {
    font-size: 1.5rem;
  }
}
</style> 