<template>
  <main class="page-container">
     
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()

onMounted(() => {
  if (!auth.isLoggedIn.value) {
    return navigateTo('/login')
  }
})
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
}

h1 {
  margin-bottom: 0.5rem;
}

h2 {
  margin-top: 1.5rem;
}

code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid;
}

.nav-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card {
  display: block;
  padding: 2rem;
  color: white;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.button {
  display: inline-flex;
  margin-top: 1rem;
  padding: 0.8rem 1.1rem;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  text-decoration: none;
}
</style>
