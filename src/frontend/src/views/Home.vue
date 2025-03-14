<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero" :style="{ backgroundImage: 'url(' + require('@/assets/images/logo2.jpg') + ')' }">
      <div class="hero-overlay">
        <div class="logo-container">
          <img :src="require('@/assets/images/logo.jpg')" alt="Avocado Air Logo" class="hero-logo">
        </div>
        <div class="hero-content">
          <h1>{{ $t('home.title') }}</h1>
          <p>{{ $t('home.subtitle') }}</p>
          <router-link to="/flights" class="cta-button">
            {{ $t('home.bookNow') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Popular Destinations -->
    <section class="destinations">
      <h2>{{ $t('home.popularDestinations') }}</h2>
      <div class="destinations-grid">
        <div class="destination-card">
          <div class="destination-image" :style="{ backgroundImage: 'url(' + require('@/assets/images/mcity1.jpg') + ')' }">
            <div class="destination-overlay">
              <h3>London</h3>
              <p>United Kingdom</p>
            </div>
          </div>
        </div>
        <div class="destination-card">
          <div class="destination-image" :style="{ backgroundImage: 'url(' + require('@/assets/images/mcity2.jpg') + ')' }">
            <div class="destination-overlay">
              <h3>Paris</h3>
              <p>France</p>
            </div>
          </div>
        </div>
        <div class="destination-card">
          <div class="destination-image" :style="{ backgroundImage: 'url(' + require('@/assets/images/mcity3.jpg') + ')' }">
            <div class="destination-overlay">
              <h3>Mexico City</h3>
              <p>Mexico</p>
            </div>
          </div>
        </div>
        <div class="destination-card">
          <div class="destination-image" :style="{ backgroundImage: 'url(' + require('@/assets/images/mcity4.jpg') + ')' }">
            <div class="destination-overlay">
              <h3>Cancun</h3>
              <p>Mexico</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>{{ $t('home.whyChooseUs') }}</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <i :class="feature.icon"></i>
          <h3>{{ $t(feature.title) }}</h3>
          <p>{{ $t(feature.description) }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  setup() {
    const features = [
      {
        icon: 'fas fa-plane',
        title: 'home.features.globalNetwork.title',
        description: 'home.features.globalNetwork.description'
      },
      {
        icon: 'fas fa-percentage',
        title: 'home.features.bestDeals.title',
        description: 'home.features.bestDeals.description'
      },
      {
        icon: 'fas fa-clock',
        title: 'home.features.onTime.title',
        description: 'home.features.onTime.description'
      },
      {
        icon: 'fas fa-star',
        title: 'home.features.premium.title',
        description: 'home.features.premium.description'
      }
    ];

    return {
      features
    };
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  height: 80vh;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 140, 91, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 0 1rem;
}

.logo-container {
  margin-bottom: 2rem;
}

.hero-logo {
  width: 200px;
  height: auto;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.hero-content {
  max-width: 800px;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
  color: #ffffff;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #ffffff;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #17b978;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.cta-button:hover {
  background-color: #20e395;
}

/* Destinations Section */
.destinations {
  padding: 4rem 1rem;
  background-color: #ffffff;
}

.destinations h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #118c5b;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.destination-card {
  position: relative;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.destination-card:hover {
  transform: translateY(-10px);
}

.destination-image {
  height: 100%;
  background-size: cover;
  background-position: center;
}

.destination-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(transparent, rgba(17, 140, 91, 0.9));
  color: white;
}

.destination-overlay h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
}

.destination-overlay p {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: #e6e6e6;
}

/* Features Section */
.features {
  padding: 4rem 1rem;
  background-color: #4de9aa;
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #118c5b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-card i {
  font-size: 2.5rem;
  color: #17b978;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #118c5b;
}

.feature-card p {
  margin: 0;
  color: #118c5b;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero p {
    font-size: 1.2rem;
  }
  
  .hero-logo {
    width: 150px;
  }
}
</style> 