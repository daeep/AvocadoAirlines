<template>
  <div class="contact-page">
    <div class="contact-header">
      <div class="logo-container">
        <img src="/images/logo.jpg" alt="Avocado Air Logo" class="contact-logo">
      </div>
      <h1>{{ $t('contact.title') }}</h1>
    </div>
    
    <div class="contact-content">
      <div class="contact-info">
        <div class="contact-image">
          <img src="/images/contact.jpg" alt="Contact Avocado Air" class="img-fluid">
        </div>
        
        <div class="info-content">
          <h2>{{ $t('contact.info.title') }}</h2>
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <p>{{ $t('contact.info.address') }}</p>
          </div>
          <div class="info-item">
            <i class="fas fa-phone"></i>
            <p>{{ $t('contact.info.phone') }}</p>
          </div>
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <p>{{ $t('contact.info.email') }}</p>
          </div>
        </div>
      </div>
      
      <form class="contact-form" @submit.prevent="submitForm">
        <h2>{{ $t('contact.form.title') }}</h2>
        <div class="form-group">
          <label for="name">{{ $t('contact.form.name') }}</label>
          <input type="text" id="name" v-model="form.name" required>
        </div>
        <div class="form-group">
          <label for="email">{{ $t('contact.form.email') }}</label>
          <input type="email" id="email" v-model="form.email" required>
        </div>
        <div class="form-group">
          <label for="subject">{{ $t('contact.form.subject') }}</label>
          <input type="text" id="subject" v-model="form.subject" required>
        </div>
        <div class="form-group">
          <label for="message">{{ $t('contact.form.message') }}</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit" class="submit-btn">{{ $t('contact.form.submit') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Contact',
  setup() {
    const form = ref({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    const submitForm = () => {
      // TODO: Implement form submission
      console.log('Form submitted:', form.value);
    };

    return {
      form,
      submitForm
    };
  }
};
</script>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.contact-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.contact-logo {
  width: 150px;
  height: auto;
  border-radius: 50%;
  border: 4px solid #17b978;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.info-content {
  background-color: #17b978;
  padding: 2rem;
  border-radius: 8px;
  color: #ffffff;
}

.info-content h2 {
  color: #ffffff;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.info-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #ffffff;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.info-item i {
  margin-right: 1rem;
  color: #4de9aa;
  font-size: 1.2rem;
}

.contact-form {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.contact-form h2 {
  color: #17b978;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.contact-form h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #4de9aa;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #118c5b;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-family: 'Poppins', Arial, sans-serif;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #17b978;
  box-shadow: 0 0 0 3px rgba(23, 185, 120, 0.2);
}

.form-group textarea {
  height: 150px;
  resize: vertical;
}

.submit-btn {
  background-color: #17b978;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Poppins', Arial, sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.submit-btn:hover {
  background-color: #118c5b;
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style> 