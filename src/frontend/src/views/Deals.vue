<template>
  <div class="deals-page">
    <div class="deals-header">
      <div class="logo-container">
        <img src="/images/logo.jpg" alt="Avocado Air Logo" class="deals-logo">
      </div>
      <h1>{{ $t('deals.title') }}</h1>
    </div>
    
    <div class="deals-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('deals.loading') }}</p>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else class="deals-grid">
        <div v-for="(deal, index) in deals" :key="deal.id" class="deal-card">
          <div class="deal-image" :style="{ backgroundImage: `url(/images/${getCityImage(index)})` }">
            <span class="discount">-{{ Math.round(deal.discountPercentage) }}%</span>
          </div>
          <div class="deal-info">
            <h3>{{ deal.origin.city }} → {{ deal.destination.city }}</h3>
            <p class="description">
              {{ $t('deals.flightDescription', { 
                origin: deal.origin.name,
                destination: deal.destination.name,
                date: formatDate(deal.departureTime)
              }) }}
            </p>
            <div class="deal-details">
              <div class="price-container">
                <span class="original-price">${{ formatPrice(deal.originalPrice) }}</span>
                <span class="price">${{ formatPrice(deal.price) }}</span>
              </div>
              <span class="validity">{{ formatTime(deal.departureTime) }}</span>
            </div>
            <router-link 
              :to="{ 
                name: 'FlightSearch',
                query: {
                  origin: deal.origin.code,
                  destination: deal.destination.code,
                  departureDate: formatDateForUrl(deal.departureTime)
                }
              }" 
              class="book-btn"
            >
              {{ $t('deals.bookNow') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../utils/api';

export default {
  name: 'Deals',
  setup() {
    const deals = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const getCityImage = (index) => {
      const cityImages = ['mcity1.jpg', 'mcity2.jpg', 'mcity3.jpg', 'mcity4.jpg'];
      return cityImages[index % cityImages.length];
    };

    const fetchDeals = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await api.get('/api/flights/deals');
        console.log('Raw API response:', JSON.stringify(response.data, null, 2));
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Process each deal to ensure prices are properly handled
          deals.value = response.data.map(deal => {
            console.log(`Processing deal ${deal.id}:`, 
              `price=${deal.price} (${typeof deal.price})`, 
              `originalPrice=${deal.originalPrice} (${typeof deal.originalPrice})`);
            
            // Force price values to be proper numbers
            const processedDeal = {
              ...deal,
              // Use explicit Number conversion with fallback
              price: deal.price != null ? Number(deal.price) : 0,
              originalPrice: deal.originalPrice != null ? Number(deal.originalPrice) : 0
            };
            
            // Log the processed values
            console.log(`After processing: price=${processedDeal.price} (${typeof processedDeal.price}), originalPrice=${processedDeal.originalPrice} (${typeof processedDeal.originalPrice})`);
            
            return processedDeal;
          });
        } else {
          // Use mock data if API returns no results
          deals.value = [
            {
              id: 1,
              flightNumber: 'AA1234',
              origin: {
                code: 'JFK',
                name: 'John F. Kennedy International Airport',
                city: 'New York',
                country: 'United States'
              },
              destination: {
                code: 'LAX',
                name: 'Los Angeles International Airport',
                city: 'Los Angeles',
                country: 'United States'
              },
              departureTime: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
              arrivalTime: new Date(Date.now() + 86400000 * 7 + 21600000).toISOString(), // 6 hours later
              price: 299.99,
              originalPrice: 399.99,
              discountPercentage: 25,
              availableSeats: 15
            },
            {
              id: 2,
              flightNumber: 'AA5678',
              origin: {
                code: 'LAX',
                name: 'Los Angeles International Airport',
                city: 'Los Angeles',
                country: 'United States'
              },
              destination: {
                code: 'MEX',
                name: 'Mexico City International Airport',
                city: 'Mexico City',
                country: 'Mexico'
              },
              departureTime: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
              arrivalTime: new Date(Date.now() + 86400000 * 10 + 14400000).toISOString(), // 4 hours later
              price: 349.99,
              originalPrice: 499.99,
              discountPercentage: 30,
              availableSeats: 8
            },
            {
              id: 3,
              flightNumber: 'AA9012',
              origin: {
                code: 'LHR',
                name: 'London Heathrow Airport',
                city: 'London',
                country: 'United Kingdom'
              },
              destination: {
                code: 'CDG',
                name: 'Charles de Gaulle Airport',
                city: 'Paris',
                country: 'France'
              },
              departureTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
              arrivalTime: new Date(Date.now() + 86400000 * 5 + 5400000).toISOString(), // 1.5 hours later
              price: 149.99,
              originalPrice: 229.99,
              discountPercentage: 35,
              availableSeats: 20
            },
            {
              id: 4,
              flightNumber: 'AA3456',
              origin: {
                code: 'SIN',
                name: 'Singapore Changi Airport',
                city: 'Singapore',
                country: 'Singapore'
              },
              destination: {
                code: 'HKG',
                name: 'Hong Kong International Airport',
                city: 'Hong Kong',
                country: 'China'
              },
              departureTime: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
              arrivalTime: new Date(Date.now() + 86400000 * 14 + 14400000).toISOString(), // 4 hours later
              price: 259.99,
              originalPrice: 399.99,
              discountPercentage: 35,
              availableSeats: 5
            }
          ];
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Error loading deals';
        console.error('Error fetching deals:', err);
        // Fallback to mock data on error
        deals.value = [
          {
            id: 1,
            flightNumber: 'AA1234',
            origin: {
              code: 'JFK',
              name: 'John F. Kennedy International Airport',
              city: 'New York',
              country: 'United States'
            },
            destination: {
              code: 'LAX',
              name: 'Los Angeles International Airport',
              city: 'Los Angeles',
              country: 'United States'
            },
            departureTime: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
            arrivalTime: new Date(Date.now() + 86400000 * 7 + 21600000).toISOString(), // 6 hours later
            price: 299.99,
            originalPrice: 399.99,
            discountPercentage: 25,
            availableSeats: 15
          },
          {
            id: 2,
            flightNumber: 'AA5678',
            origin: {
              code: 'LAX',
              name: 'Los Angeles International Airport',
              city: 'Los Angeles',
              country: 'United States'
            },
            destination: {
              code: 'MEX',
              name: 'Mexico City International Airport',
              city: 'Mexico City',
              country: 'Mexico'
            },
            departureTime: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
            arrivalTime: new Date(Date.now() + 86400000 * 10 + 14400000).toISOString(), // 4 hours later
            price: 349.99,
            originalPrice: 499.99,
            discountPercentage: 30,
            availableSeats: 8
          }
        ];
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatPrice = (price) => {
      // Simple implementation that works with numbers
      return (price || 0).toFixed(2);
    };

    const formatDateForUrl = (date) => {
      const d = new Date(date);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };

    onMounted(() => {
      fetchDeals();
    });

    return {
      deals,
      loading,
      error,
      formatDate,
      formatTime,
      formatPrice,
      formatDateForUrl,
      getCityImage
    };
  }
};
</script>

<style scoped>
.deals-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.deals-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.deals-logo {
  width: 150px;
  height: auto;
  border-radius: 50%;
  border: 4px solid #17b978;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.deals-content {
  margin-top: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e6e6e6;
  border-top: 5px solid #17b978;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #ff4444;
  background-color: #ffecec;
  border-radius: 8px;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.deal-card {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.deal-card:hover {
  transform: translateY(-10px);
}

.deal-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.discount {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #17b978;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.1rem;
}

.deal-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.deal-info h3 {
  margin: 0 0 0.75rem 0;
  color: #118c5b;
  font-size: 1.5rem;
  line-height: 1.4;
}

.description {
  color: #118c5b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 1rem;
}

.deal-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}

.price {
  color: #17b978;
  font-size: 1.5rem;
  font-weight: bold;
}

.validity {
  background-color: #e6e6e6;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #118c5b;
}

.book-btn {
  display: inline-block;
  background-color: #17b978;
  color: white;
  padding: 0.75rem 1.5rem;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-top: auto;
}

.book-btn:hover {
  background-color: #118c5b;
  text-decoration: none;
}

@media (max-width: 768px) {
  .deals-grid {
    grid-template-columns: 1fr;
  }
}
</style> 