<template> 
  <div class="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
    <div class="fixed left-4 top-4">
      <img  v-if="theme !== 'dark'"  style="height:40px" src="/assets/img/churchlogo.png"> 
      <img v-if="theme === 'dark'" style="height:40px" src="/assets/img/churchlogo2.png"> 
    </div>
    <div class="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
      <button v-if="isLoggedIn"
        type="button"
        @click="navDashboard"
        class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {{ 'Dashboard' }}
      </button>
      <button v-if="isLoggedIn"
        type="button"
        @click="navKPI"
        class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {{ 'KPI' }}
      </button>
        <button v-if="isLoggedIn"
        type="button"
        @click="navCalendar"
        class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {{ 'Calendar' }}
      </button>
      <button v-if="!isLoggedIn"
        type="button"
        @click="navLogin"
        class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {{ 'Login' }}
      </button> 
      <button v-if="isLoggedIn"
        type="button"
        @click="logout"
        class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {{ 'Logout' }}
      </button>
      <Toggle v-model="themeSwitch" off-label="Light" on-label="Dark" /> 
    </div>

    <NuxtPage />
  </div>
</template>
<style src="@vueform/toggle/themes/default.css"></style>
<script setup lang="ts">
import Toggle from '@vueform/toggle'
import { computed, onMounted, ref, watch,  } from 'vue';
import { useHead } from '#imports';
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const auth = useAuth();
const router = useRouter();

const theme = ref('light');
const themeSwitch = ref(true);
const themeLabel = computed(() => theme.value === 'dark' ? 'Dark' : 'Light');
const isLoggedIn = computed(() => auth.isLoggedIn.value);
const logout = async () => {   
  auth.signOut();
  await router.push("/login");
}

const navhome = async () => {   
  await router.push("/");
}

const navDashboard = async () => {   
  await router.push("/dashboard");
}

const navKPI = async () => {   
  await router.push("/kpi");
}

const navLogin = async () => {   
  await router.push("/login");
}

const navCalendar = async () => {   
  await router.push("/calendar");
}

onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'light';
  if(isLoggedIn.value) {
    router.push("/dashboard"); 
  } else { 
    router.push("/login");
  }
});

watch(themeSwitch, (value) => {
  console.log(value);
  theme.value = value ? 'light' : 'dark';
  localStorage.setItem('theme', value);
});



useHead({ htmlAttrs: computed(() => ({ class: theme.value })) });
</script>
