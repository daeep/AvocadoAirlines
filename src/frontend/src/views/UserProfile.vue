<!-- UserProfile component updated with AvocadoAir branding colors -->
<template>
  <div class="user-profile">
    <div class="profile-header">
      <img src="/images/logo.jpg" alt="Avocado Air Logo" class="header-logo" />
      <h1>{{ $t('profile.title') }}</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchUserProfile" class="btn btn-primary">{{ $t('common.tryAgain') }}</button>
    </div>
    
    <div v-else class="profile-container">
      <div class="profile-sidebar">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
          <h3>{{ user.firstName }} {{ user.lastName }}</h3>
          <p class="user-since">{{ $t('profile.memberSince') }} {{ formatDate(user.createdAt) }}</p>
        </div>
        
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('profile.stats.trips') }}</span>
            <span class="stat-value">{{ user.stats.totalTrips }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('profile.stats.miles') }}</span>
            <span class="stat-value">{{ formatNumber(user.stats.totalMiles) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('profile.stats.points') }}</span>
            <span class="stat-value">{{ formatNumber(user.stats.loyaltyPoints) }}</span>
          </div>
        </div>
        
        <div class="sidebar-actions">
          <button @click="logout" class="btn btn-secondary">
            <i class="fas fa-sign-out-alt"></i> {{ $t('nav.logout') }}
          </button>
        </div>
      </div>
      
      <div class="profile-content">
        <div class="profile-section profile-info">
          <div class="section-header">
            <h2>{{ $t('profile.personalInfo.title') }}</h2>
            <button 
              @click="editMode.personal = !editMode.personal" 
              class="btn-icon"
              :class="{ 'active': editMode.personal }"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
          </div>
          
          <form @submit.prevent="updatePersonalInfo" v-if="editMode.personal">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">{{ $t('profile.personalInfo.firstName') }}</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="userForm.firstName" 
                  required 
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label for="lastName">{{ $t('profile.personalInfo.lastName') }}</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="userForm.lastName" 
                  required 
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">{{ $t('profile.personalInfo.email') }}</label>
              <input 
                type="email" 
                id="email" 
                v-model="userForm.email" 
                required 
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="phone">{{ $t('profile.personalInfo.phone') }}</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="userForm.phone" 
                class="form-control"
                :placeholder="$t('profile.personalInfo.phoneOptional')"
              />
            </div>
            
            <div class="form-actions">
              <button type="button" @click="cancelPersonalEdit" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="updating">
                <span v-if="updating">{{ $t('common.saving') }}</span>
                <span v-else>{{ $t('profile.save') }}</span>
              </button>
            </div>
          </form>
          
          <div class="info-display" v-else>
            <div class="info-row">
              <span class="info-label">{{ $t('profile.personalInfo.firstName') }}:</span>
              <span class="info-value">{{ user.firstName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('profile.personalInfo.lastName') }}:</span>
              <span class="info-value">{{ user.lastName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('profile.personalInfo.email') }}:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('profile.personalInfo.phone') }}:</span>
              <span class="info-value">{{ user.phone || $t('profile.personalInfo.phoneNotProvided') }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-section address-info">
          <div class="section-header">
            <h2>{{ $t('profile.address.title') }}</h2>
            <button 
              @click="editMode.address = !editMode.address" 
              class="btn-icon"
              :class="{ 'active': editMode.address }"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
          </div>
          
          <form @submit.prevent="updateAddressInfo" v-if="editMode.address">
            <div class="form-group">
              <label for="street">{{ $t('profile.address.street') }}</label>
              <input 
                type="text" 
                id="street" 
                v-model="userForm.address.street" 
                class="form-control"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">{{ $t('profile.address.city') }}</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="userForm.address.city" 
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label for="state">{{ $t('profile.address.state') }}</label>
                <input 
                  type="text" 
                  id="state" 
                  v-model="userForm.address.state" 
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="zipCode">{{ $t('profile.address.zipCode') }}</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  v-model="userForm.address.zipCode" 
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label for="country">{{ $t('profile.address.country') }}</label>
                <input 
                  type="text" 
                  id="country" 
                  v-model="userForm.address.country" 
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="cancelAddressEdit" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="updating">
                <span v-if="updating">{{ $t('common.saving') }}</span>
                <span v-else>{{ $t('profile.save') }}</span>
              </button>
            </div>
          </form>
          
          <div class="info-display" v-else>
            <div v-if="hasAddress">
              <div class="info-row">
                <span class="info-label">{{ $t('profile.address.street') }}:</span>
                <span class="info-value">{{ user.address.street }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ $t('profile.address.city') }}:</span>
                <span class="info-value">{{ user.address.city }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ $t('profile.address.state') }}:</span>
                <span class="info-value">{{ user.address.state }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ $t('profile.address.zipCode') }}:</span>
                <span class="info-value">{{ user.address.zipCode }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ $t('profile.address.country') }}:</span>
                <span class="info-value">{{ user.address.country }}</span>
              </div>
            </div>
            <div v-else class="no-address">
              <p>{{ $t('profile.address.noAddress') }}</p>
              <button @click="editMode.address = true" class="btn btn-sm">{{ $t('profile.address.addAddress') }}</button>
            </div>
          </div>
        </div>
        
        <div class="profile-section password-update">
          <div class="section-header">
            <h2>{{ $t('profile.password.title') }}</h2>
          </div>
          
          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label for="currentPassword">{{ $t('profile.password.current') }}</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                required 
                class="form-control"
                :placeholder="$t('profile.password.currentPlaceholder')"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="newPassword">{{ $t('profile.password.new') }}</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  v-model="passwordForm.newPassword" 
                  required 
                  class="form-control"
                  :placeholder="$t('profile.password.newPlaceholder')"
                  minlength="8"
                />
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">{{ $t('profile.password.confirm') }}</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="passwordForm.confirmPassword" 
                  required 
                  class="form-control"
                  :placeholder="$t('profile.password.confirmPlaceholder')"
                  minlength="8"
                />
              </div>
            </div>
            
            <div v-if="passwordError" class="alert alert-danger">
              {{ passwordError }}
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="updatingPassword">
                <span v-if="updatingPassword">{{ $t('common.updating') }}</span>
                <span v-else>{{ $t('profile.password.update') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'UserProfile',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const loading = ref(true);
    const error = ref('');
    const updating = ref(false);
    const updatingPassword = ref(false);
    const passwordError = ref('');
    
    // User data
    const user = ref({
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      createdAt: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      stats: {
        totalTrips: 0,
        totalMiles: 0,
        loyaltyPoints: 0
      }
    });
    
    // Form data for editing
    const userForm = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    
    // Password form
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Edit mode toggles
    const editMode = reactive({
      personal: false,
      address: false
    });
    
    // Check if user has address info
    const hasAddress = computed(() => {
      return user.value.address && 
             (user.value.address.street || 
              user.value.address.city || 
              user.value.address.state || 
              user.value.address.zipCode || 
              user.value.address.country);
    });
    
    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    // Format number with commas
    const formatNumber = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // Fetch user profile
    const fetchUserProfile = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // In a real application, this would call the API
        // For demonstration, we'll simulate API response with mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample user data
        user.value = {
          id: '12345',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          createdAt: '2022-05-15T10:30:00Z',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States'
          },
          stats: {
            totalTrips: 8,
            totalMiles: 24750,
            loyaltyPoints: 12500
          }
        };
        
        // Initialize form data
        initializeFormData();
      } catch (err) {
        console.error('Error fetching user profile:', err);
        error.value = 'Failed to load profile information. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    // Initialize form data from user object
    const initializeFormData = () => {
      userForm.firstName = user.value.firstName;
      userForm.lastName = user.value.lastName;
      userForm.email = user.value.email;
      userForm.phone = user.value.phone || '';
      
      userForm.address.street = user.value.address?.street || '';
      userForm.address.city = user.value.address?.city || '';
      userForm.address.state = user.value.address?.state || '';
      userForm.address.zipCode = user.value.address?.zipCode || '';
      userForm.address.country = user.value.address?.country || '';
    };
    
    // Update personal information
    const updatePersonalInfo = async () => {
      updating.value = true;
      
      try {
        // In a real application, this would call the API
        // For demonstration, we'll simulate API response
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the user object with form data
        user.value.firstName = userForm.firstName;
        user.value.lastName = userForm.lastName;
        user.value.email = userForm.email;
        user.value.phone = userForm.phone;
        
        // Exit edit mode
        editMode.personal = false;
        
        // Show success message
        alert('Personal information updated successfully.');
      } catch (err) {
        console.error('Error updating personal info:', err);
        alert('Failed to update personal information. Please try again.');
      } finally {
        updating.value = false;
      }
    };
    
    // Update address information
    const updateAddressInfo = async () => {
      updating.value = true;
      
      try {
        // In a real application, this would call the API
        // For demonstration, we'll simulate API response
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the user object with form data
        user.value.address = { ...userForm.address };
        
        // Exit edit mode
        editMode.address = false;
        
        // Show success message
        alert('Address information updated successfully.');
      } catch (err) {
        console.error('Error updating address info:', err);
        alert('Failed to update address information. Please try again.');
      } finally {
        updating.value = false;
      }
    };
    
    // Update password
    const updatePassword = async () => {
      updatingPassword.value = true;
      passwordError.value = '';
      
      // Check if passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordError.value = 'New passwords do not match.';
        updatingPassword.value = false;
        return;
      }
      
      try {
        // In a real application, this would call the API
        // For demonstration, we'll simulate API response
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if current password is correct (mock validation)
        if (passwordForm.currentPassword !== 'password123') {
          passwordError.value = 'Current password is incorrect.';
          return;
        }
        
        // Reset form
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        // Show success message
        alert('Password updated successfully.');
      } catch (err) {
        console.error('Error updating password:', err);
        passwordError.value = 'Failed to update password. Please try again.';
      } finally {
        updatingPassword.value = false;
      }
    };
    
    // Cancel personal info edit
    const cancelPersonalEdit = () => {
      initializeFormData();
      editMode.personal = false;
    };
    
    // Cancel address edit
    const cancelAddressEdit = () => {
      initializeFormData();
      editMode.address = false;
    };
    
    // Log out
    const logout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/');
      } catch (err) {
        console.error('Error logging out:', err);
        alert('Failed to log out. Please try again.');
      }
    };
    
    // Fetch user profile when the component mounts
    onMounted(() => {
      fetchUserProfile();
    });
    
    return {
      user,
      userForm,
      passwordForm,
      loading,
      error,
      updating,
      updatingPassword,
      passwordError,
      editMode,
      hasAddress,
      formatDate,
      formatNumber,
      fetchUserProfile,
      updatePersonalInfo,
      updateAddressInfo,
      updatePassword,
      cancelPersonalEdit,
      cancelAddressEdit,
      logout
    };
  }
};
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.header-logo {
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 3px solid #4CAF50;
}

.user-profile h1 {
  color: #2E7D32;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem 0;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.profile-sidebar {
  background-color: #F1F8E9;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;
  border: 1px solid #DCEDC8;
}

.user-avatar {
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-avatar i {
  font-size: 5rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.user-avatar h3 {
  margin-bottom: 0.5rem;
  color: #2E7D32;
}

.user-since {
  color: #666;
  font-size: 0.9rem;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid #DCEDC8;
  border-bottom: 1px solid #DCEDC8;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: bold;
  color: #2E7D32;
  font-size: 1.1rem;
}

.sidebar-actions {
  width: 100%;
  margin-top: 1rem;
}

.sidebar-actions button {
  width: 100%;
}

.profile-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #DCEDC8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #DCEDC8;
}

.section-header h2 {
  color: #2E7D32;
  margin: 0;
  font-size: 1.5rem;
}

.btn-icon {
  background: none;
  border: 1px solid #DCEDC8;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2E7D32;
  transition: all 0.3s;
}

.btn-icon:hover, .btn-icon.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.info-display {
  padding: 0.5rem 0;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-label {
  width: 140px;
  font-weight: bold;
  color: #666;
}

.info-value {
  flex-grow: 1;
}

.no-address {
  color: #666;
  text-align: center;
  padding: 1rem 0;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #DCEDC8;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #388E3C;
}

.btn-secondary {
  background-color: #616161;
  color: white;
}

.btn-secondary:hover {
  background-color: #424242;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .info-label {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style> 