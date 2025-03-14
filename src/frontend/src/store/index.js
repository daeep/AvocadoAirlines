import { createStore } from 'vuex';
import auth from './modules/auth';
import flights from './modules/flights';
import reservations from './modules/reservations';

export default createStore({
  modules: {
    auth,
    flights,
    reservations
  }
}); 