<template>
  <div class="language-selector">
    <select v-model="selectedLanguage" @change="changeLanguage">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="ru">Русский</option>
      <option value="zh">中文</option>
      <option value="pt">Português</option>
    </select>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'LanguageSelector',
  setup() {
    const { locale } = useI18n();
    const selectedLanguage = ref(locale.value);

    onMounted(() => {
      // Set initial language from localStorage or default to 'en'
      const savedLanguage = localStorage.getItem('language') || 'en';
      selectedLanguage.value = savedLanguage;
      locale.value = savedLanguage;
    });

    const changeLanguage = () => {
      locale.value = selectedLanguage.value;
      localStorage.setItem('language', selectedLanguage.value);
      // Reload the page to apply the new language
      window.location.reload();
    };

    return {
      selectedLanguage,
      changeLanguage
    };
  }
};
</script>

<style scoped>
.language-selector {
  margin: 0 1rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

select:hover {
  border-color: #999;
}

select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style> 