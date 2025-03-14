<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link to="/" class="logo-link">
            <img src="/images/logo.jpg" alt="AvocadoAir Logo" class="main-logo">
          </router-link>
        </div>
        
        <button class="navbar-toggle" @click="isMenuOpen = !isMenuOpen">
          <span class="hamburger"></span>
          <span class="hamburger"></span>
          <span class="hamburger"></span>
        </button>

        <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
          <div class="navbar-start">
            <router-link to="/" class="navbar-item">{{ $t('nav.home') }}</router-link>
            <router-link to="/flights" class="navbar-item">{{ $t('nav.flights') }}</router-link>
            <router-link to="/deals" class="navbar-item">{{ $t('nav.deals') }}</router-link>
            <router-link to="/about" class="navbar-item">{{ $t('nav.about') }}</router-link>
            <router-link to="/contact" class="navbar-item">{{ $t('nav.contact') }}</router-link>
          </div>
          
          <div class="navbar-end">
            <LanguageSelector class="language-selector" />
            <template v-if="isAuthenticated">
              <router-link to="/profile" class="navbar-item">{{ $t('nav.profile') }}</router-link>
              <router-link to="/reservations" class="navbar-item">{{ $t('nav.reservations') }}</router-link>
              <a @click="logout" class="navbar-item">{{ $t('nav.logout') }}</a>
            </template>
            <template v-else>
              <router-link to="/login" class="navbar-item login-btn">{{ $t('nav.login') }}</router-link>
              <router-link to="/register" class="navbar-item register-btn">{{ $t('nav.register') }}</router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ $t('app.name') }}</h3>
          <p>{{ $t('app.tagline') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.quickLinks') }}</h4>
          <router-link to="/flights">{{ $t('nav.flights') }}</router-link>
          <router-link to="/deals">{{ $t('nav.deals') }}</router-link>
          <router-link to="/about">{{ $t('nav.about') }}</router-link>
          <router-link to="/contact">{{ $t('nav.contact') }}</router-link>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.contact') }}</h4>
          <p>Email: {{ $t('contact.info.email') }}</p>
          <p>Phone: {{ $t('contact.info.phone') }}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} {{ $t('app.name') }}. {{ $t('footer.rights') }}</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LanguageSelector from './components/LanguageSelector.vue';

export default {
  name: 'App',
  components: {
    LanguageSelector
  },
  setup() {
    const store = useStore();
    const isMenuOpen = ref(false);

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const currentUser = computed(() => store.getters['auth/currentUser']);

    const logout = async () => {
      await store.dispatch('auth/logout');
      // Close menu after logout on mobile
      isMenuOpen.value = false;
    };

    // Initialize auth state when app starts
    onMounted(() => {
      store.dispatch('auth/initAuth');
    });

    return {
      isMenuOpen,
      isAuthenticated,
      currentUser,
      logout
    };
  }
};
</script>

<style>
#app {
  font-family: 'Poppins', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #4de9aa;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.main-logo {
  height: 50px;
  width: auto;
  border-radius: 50%;
  border: 3px solid #20e395;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.navbar {
  background-color: #17b978;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
}

.navbar-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.navbar-start {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.navbar-item {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-weight: 500;
}

.navbar-item:hover {
  background-color: #20e395;
  color: #ffffff;
  text-decoration: none;
}

.login-btn, .register-btn {
  padding: 0.5rem 1.25rem;
  font-weight: 600;
}

.login-btn {
  background-color: #20e395;
  color: #118c5b;
}

.register-btn {
  background-color: #118c5b;
  color: #ffffff;
}

.login-btn:hover {
  background-color: #4de9aa;
}

.register-btn:hover {
  background-color: #0a6e44;
}

.language-selector {
  margin-right: 1rem;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  display: block;
  width: 25px;
  height: 3px;
  background-color: #ffffff;
  margin: 5px 0;
  transition: all 0.3s;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.footer {
  background-color: #118c5b;
  color: white;
  padding: 3rem 1rem 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-section h3 {
  font-size: 1.5rem;
  margin: 0;
  color: #4de9aa;
}

.footer-section h4 {
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  color: #4de9aa;
}

.footer-section a {
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.footer-section a:hover {
  opacity: 1;
  color: #4de9aa;
  text-decoration: none;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.book-btn {
  display: block;
  width: 100%;
  background-color: #17b978;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  margin-top: auto;
}

.book-btn:hover {
  background-color: #118c5b;
  text-decoration: none;
}

.feature-card i {
  font-size: 2.5rem;
  color: #17b978;
  margin-bottom: 1rem;
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
  background-color: #118c5b;
  text-decoration: none;
}

/* Responsive styles */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .navbar-container {
    position: relative;
  }

  .navbar-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #17b978;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .navbar-menu.is-active {
    display: flex;
  }

  .navbar-start {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .navbar-end {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin-left: 0;
    margin-top: 1rem;
  }

  .navbar-toggle {
    display: block;
  }

  .navbar-item, .login-btn, .register-btn {
    display: block;
    width: 100%;
    text-align: center;
  }

  .language-selector {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .main-logo {
    height: 40px;
  }

  .navbar {
    padding: 0.75rem;
  }

  .footer {
    padding: 2rem 1rem 1rem;
  }

  .footer-section h3 {
    font-size: 1.25rem;
  }

  .footer-section h4 {
    font-size: 1.1rem;
  }
}
</style> 