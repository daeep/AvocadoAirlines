<template>
  <div class="login-container">
    <div class="auth-form">
      <div class="auth-header">
        <router-link to="/" class="logo-link">
          <img src="/images/logo.jpg" alt="AvocadoAir Logo" class="login-logo">
        </router-link>
        <h2>{{ $t('auth.login.title') }}</h2>
      </div>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{ $t('auth.login.username') }}</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            required 
            class="form-control"
            :placeholder="$t('auth.login.username')"
          />
        </div>
        
        <div class="form-group">
          <label for="password">{{ $t('auth.login.password') }}</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required 
            class="form-control"
            :placeholder="$t('auth.login.password')"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('auth.login.submit') }}</span>
          </button>
        </div>
      </form>
      
      <div class="auth-links">
        <p>
          {{ $t('auth.login.noAccount') }} 
          <router-link to="/register">{{ $t('auth.login.register') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const form = ref({
      username: '',
      password: ''
    });
    
    const loading = ref(false);
    const error = ref('');
    
    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const result = await store.dispatch('auth/login', form.value);
        
        if (result.success) {
          // Redirect to the requested page or home
          const redirectPath = route.query.redirect || '/';
          router.push(redirectPath);
        } else {
          error.value = result.message || 'Login failed. Please check your credentials.';
        }
      } catch (err) {
        console.error('Login error:', err);
        error.value = 'An unexpected error occurred. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      form,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.auth-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid #e6e6e6;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.login-logo {
  height: 80px;
  width: auto;
  border-radius: 50%;
  border: 3px solid #17b978;
  margin-bottom: 1rem;
}

.auth-form h2 {
  color: #118c5b;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
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
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #17b978;
  box-shadow: 0 0 0 2px rgba(23, 185, 120, 0.2);
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.btn-primary {
  background-color: #17b978;
  color: white;
}

.btn-primary:hover {
  background-color: #118c5b;
}

.btn:disabled {
  background-color: #4de9aa;
  cursor: not-allowed;
  opacity: 0.7;
}

.alert {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  color: #118c5b;
}

.auth-links a {
  color: #17b978;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  color: #20e395;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .auth-form {
    padding: 1.5rem;
  }
}
</style> 