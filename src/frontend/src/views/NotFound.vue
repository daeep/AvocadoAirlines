<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>We can't seem to find the page you're looking for.</p>
      <router-link to="/" class="btn-home">Back to Home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
}

.not-found h1 {
  font-size: 6rem;
  font-weight: bold;
  color: #4CAF50;
  margin: 0;
  line-height: 1;
}

.not-found h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-home:hover {
  background-color: #2E7D32;
}
</style> 