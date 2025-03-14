<template>
  <div class="about-page">
    <div class="about-header">
      <div class="logo-container">
        <img src="/images/logo.jpg" alt="Avocado Air Logo" class="about-logo">
      </div>
      <h1>{{ $t('about.title') }}</h1>
    </div>
    
    <div class="about-content">
      <div class="about-image">
        <img src="/images/about.jpg" alt="About Avocado Air" class="img-fluid">
      </div>
      
      <div class="about-text">
        <section class="about-section">
          <h2>{{ $t('about.ourStory.title') }}</h2>
          <p>{{ $t('about.ourStory.content') }}</p>
        </section>
        
        <section class="about-section">
          <h2>{{ $t('about.mission.title') }}</h2>
          <p>{{ $t('about.mission.content') }}</p>
        </section>
        
        <section class="about-section">
          <h2>{{ $t('about.values.title') }}</h2>
          <ul class="values-list">
            <li v-for="(value, index) in localizedValues" :key="index">
              <strong>{{ value.title }}</strong>
              <p>{{ value.description }}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  computed: {
    currentLocale() {
      return this.$i18n.locale;
    },
    localizedValues() {
      // Values for each language
      const valuesByLanguage = {
        en: [
          {
            title: "Sustainability",
            description: "We are committed to reducing our environmental impact through fuel-efficient aircraft, carbon offset programs, and sustainable practices across all our operations."
          },
          {
            title: "Customer-Centric",
            description: "Our passengers are at the heart of everything we do. We listen to your needs and continuously improve our services to exceed your expectations."
          },
          {
            title: "Innovation",
            description: "We embrace new technologies and ideas to enhance the travel experience and make flying more efficient, comfortable, and enjoyable."
          },
          {
            title: "Safety",
            description: "Safety is our top priority. We maintain the highest safety standards in all aspects of our operations, from aircraft maintenance to crew training."
          }
        ],
        es: [
          {
            title: "Sostenibilidad",
            description: "Estamos comprometidos a reducir nuestro impacto ambiental a través de aviones eficientes en combustible, programas de compensación de carbono y prácticas sostenibles en todas nuestras operaciones."
          },
          {
            title: "Centrado en el Cliente",
            description: "Nuestros pasajeros están en el centro de todo lo que hacemos. Escuchamos sus necesidades y mejoramos continuamente nuestros servicios para superar sus expectativas."
          },
          {
            title: "Innovación",
            description: "Adoptamos nuevas tecnologías e ideas para mejorar la experiencia de viaje y hacer que volar sea más eficiente, cómodo y agradable."
          },
          {
            title: "Seguridad",
            description: "La seguridad es nuestra máxima prioridad. Mantenemos los más altos estándares de seguridad en todos los aspectos de nuestras operaciones, desde el mantenimiento de aeronaves hasta la formación de la tripulación."
          }
        ],
        fr: [
          {
            title: "Durabilité",
            description: "Nous nous engageons à réduire notre impact environnemental grâce à des avions économes en carburant, des programmes de compensation carbone et des pratiques durables dans toutes nos opérations."
          },
          {
            title: "Centré sur le Client",
            description: "Nos passagers sont au cœur de tout ce que nous faisons. Nous écoutons vos besoins et améliorons continuellement nos services pour dépasser vos attentes."
          },
          {
            title: "Innovation",
            description: "Nous adoptons de nouvelles technologies et idées pour améliorer l'expérience de voyage et rendre le vol plus efficace, confortable et agréable."
          },
          {
            title: "Sécurité",
            description: "La sécurité est notre priorité absolue. Nous maintenons les normes de sécurité les plus élevées dans tous les aspects de nos opérations, de la maintenance des avions à la formation de l'équipage."
          }
        ],
        ru: [
          {
            title: "Устойчивое развитие",
            description: "Мы стремимся снизить наше воздействие на окружающую среду с помощью экономичных самолетов, программ компенсации выбросов углерода и устойчивых практик во всех наших операциях."
          },
          {
            title: "Ориентация на клиента",
            description: "Наши пассажиры находятся в центре всего, что мы делаем. Мы прислушиваемся к вашим потребностям и постоянно улучшаем наши услуги, чтобы превзойти ваши ожидания."
          },
          {
            title: "Инновации",
            description: "Мы внедряем новые технологии и идеи для улучшения опыта путешествий и делаем полеты более эффективными, комфортными и приятными."
          },
          {
            title: "Безопасность",
            description: "Безопасность - наш главный приоритет. Мы поддерживаем самые высокие стандарты безопасности во всех аспектах нашей деятельности, от обслуживания самолетов до обучения экипажа."
          }
        ],
        pt: [
          {
            title: "Sustentabilidade",
            description: "Estamos comprometidos em reduzir nosso impacto ambiental por meio de aeronaves eficientes em termos de combustível, programas de compensação de carbono e práticas sustentáveis em todas as nossas operações."
          },
          {
            title: "Centrado no Cliente",
            description: "Nossos passageiros estão no centro de tudo o que fazemos. Ouvimos suas necessidades e melhoramos continuamente nossos serviços para superar suas expectativas."
          },
          {
            title: "Inovação",
            description: "Adotamos novas tecnologias e ideias para melhorar a experiência de viagem e tornar o voo mais eficiente, confortável e agradável."
          },
          {
            title: "Segurança",
            description: "A segurança é nossa principal prioridade. Mantemos os mais altos padrões de segurança em todos os aspectos de nossas operações, desde a manutenção de aeronaves até o treinamento da tripulação."
          }
        ],
        zh: [
          {
            title: "可持续发展",
            description: "我们致力于通过燃油效率高的飞机、碳补偿计划和在所有运营中采用可持续实践来减少我们对环境的影响。"
          },
          {
            title: "以客户为中心",
            description: "我们的乘客是我们所做一切的核心。我们倾听您的需求，并不断改进我们的服务，以超越您的期望。"
          },
          {
            title: "创新",
            description: "我们采用新技术和理念来提升旅行体验，使飞行更加高效、舒适和愉快。"
          },
          {
            title: "安全",
            description: "安全是我们的首要任务。我们在运营的各个方面都保持最高的安全标准，从飞机维护到机组人员培训。"
          }
        ]
      };
      
      // Return values for current locale, or fallback to English
      return valuesByLanguage[this.currentLocale] || valuesByLanguage.en;
    }
  }
};
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.about-logo {
  width: 150px;
  height: auto;
  border-radius: 50%;
  border: 4px solid #4CAF50;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.about-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.about-section {
  margin-bottom: 2.5rem;
}

.about-section h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.about-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #2E7D32;
}

.values-list {
  list-style: none;
  padding: 0;
}

.values-list li {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #4CAF50;
}

.values-list strong {
  display: block;
  color: #4CAF50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .about-image {
    order: -1;
  }
}
</style> 