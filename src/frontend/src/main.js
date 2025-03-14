import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import './assets/styles/main.css';

// Initialize auth state from localStorage
store.dispatch('auth/initAuth');

// Create and mount the Vue application
const app = createApp(App);

// Use router, store and i18n
app.use(router);
app.use(store);
app.use(i18n);

// Mount app
app.mount('#app'); 