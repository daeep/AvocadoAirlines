import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// Import views
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import FlightSearch from '../views/FlightSearch.vue';
import FlightResults from '../views/FlightResults.vue';
import BookingForm from '../views/BookingForm.vue';
import PaymentForm from '../views/PaymentForm.vue';
import BookingConfirmation from '../views/BookingConfirmation.vue';
import MyReservations from '../views/MyReservations.vue';
import UserProfile from '../views/UserProfile.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';
import Deals from '../views/Deals.vue';
import NotFound from '../views/NotFound.vue';

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/flights',
    name: 'FlightSearch',
    component: FlightSearch
  },
  {
    path: '/flights/results',
    name: 'FlightResults',
    component: FlightResults,
    props: route => ({ query: route.query })
  },
  {
    path: '/booking/:flightId',
    name: 'BookingForm',
    component: BookingForm,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/payment/:reservationId',
    name: 'PaymentForm',
    component: PaymentForm,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/confirmation/:reservationId',
    name: 'BookingConfirmation',
    component: BookingConfirmation,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/reservations',
    name: 'MyReservations',
    component: MyReservations,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/deals',
    name: 'Deals',
    component: Deals
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } 
  // Check if route is for guests only
  else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuthenticated) {
      // Redirect to home if already authenticated
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router; 