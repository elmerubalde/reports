<template>
  <main class="page-container">
    <header class="mb-1 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg text-white">
      <div class="flex flex-wrap items-center justify-between gap-1">
        <div>
          <h1 class="text-3xl font-bold">NewCMS</h1>
          <p class="mt-1 text-blue-100">Quick access to login, people directory, and calendar pages.</p>
        </div>
        <div class="flex flex-wrap items-center gap-1">
          <NuxtLink to="/login" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">🔐</span>Login
          </NuxtLink>
           <NuxtLink to="/dashboard" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">📊</span>Dashboard
          </NuxtLink>
          <NuxtLink to="/calendar" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">📅</span>Calendar
          </NuxtLink>
          <NuxtLink to="/attendance" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">📊</span>Attendance
          </NuxtLink>
          <NuxtLink to="/report" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">📈</span>Report
          </NuxtLink>
          <NuxtLink to="/event-registration" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">✍️</span>Register
          </NuxtLink>
          <NuxtLink to="/people" class="nav-button bg-white/10 hover:bg-white/20 border-white/20">
            <span class="mr-2">👥</span>People
          </NuxtLink>
        </div>
      </div>
    </header>
 
    <section class="mb-1">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink to="/login" class="action-card bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          <div class="text-4xl mb-3">🔐</div>
          <h3 class="text-xl font-semibold mb-2">Login</h3>
          <p class="text-blue-100">Access your account and manage your profile</p>
        </NuxtLink>
        <NuxtLink to="/calendar" class="action-card bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <div class="text-4xl mb-3">📅</div>
          <h3 class="text-xl font-semibold mb-2">Calendar</h3>
          <p class="text-green-100">View upcoming events and schedules</p>
        </NuxtLink>
        <NuxtLink to="/attendance" class="action-card bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
          <div class="text-4xl mb-3">📊</div>
          <h3 class="text-xl font-semibold mb-2">Attendance</h3>
          <p class="text-purple-100">Track and manage attendance records</p>
        </NuxtLink>
        <NuxtLink to="/report" class="action-card bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
          <div class="text-4xl mb-3">📈</div>
          <h3 class="text-xl font-semibold mb-2">Reports</h3>
          <p class="text-red-100">Generate and view detailed reports</p>
        </NuxtLink>
        <NuxtLink to="/event-registration" class="action-card bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
          <div class="text-4xl mb-3">✍️</div>
          <h3 class="text-xl font-semibold mb-2">Event Registration</h3>
          <p class="text-yellow-100">Register for upcoming events</p>
        </NuxtLink>
        <NuxtLink to="/people" class="action-card bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
          <div class="text-4xl mb-3">👥</div>
          <h3 class="text-xl font-semibold mb-2">People Directory</h3>
          <p class="text-indigo-100">Browse and manage people records</p>
        </NuxtLink>
      </div>
    </section>

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
