<template>
  <main class="login-page"> 
    <section class="login-card">
      <h1>Login to NewCMS</h1>
      <form @submit.prevent="submit">
        <label>
          Username
          <input v-model="username" type="text" autocomplete="username" required />
        </label>

        <label>
          Password
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <button type="submit">Sign in</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <button type="button" @click="signInWithGoogle" class="google-btn">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

declare global {
  interface Window {
    google: any;
  }
}

const auth = useAuth();
const username = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const submit = async () => {
  error.value = "";

  try {
    await auth.signIn(username.value.trim(), password.value);
    await router.push("/");
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "Login failed. Please check your credentials.";
    }
  }
};

const signInWithGoogle = () => {
  if (!window.google) {
    error.value = "Google Identity script not loaded yet. Please refresh the page.";
    return;
  }

  window.google.accounts.id.initialize({
    client_id: runtimeConfig.public.googleClientId,
    callback: handleCredentialResponse
  });
  window.google.accounts.id.prompt();
};

const handleCredentialResponse = async (response: any) => {
  try {
    await auth.signInWithGoogle(response.credential);
    await router.push("/people");
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "Google login failed.";
    }
  }
};

onMounted(() => {
  // Load Google Identity Services script
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f4f7fb;
}

.login-card {
  width: min(420px, 100%);
  padding: 2rem;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(20, 40, 80, 0.08);
}

h1 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

label {
  display: block;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #333;
}

input {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid #d8dde6;
  border-radius: 10px;
  background: #fbfcff;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #d8dde6;
  color: #333;
  font-weight: 500;
}

.google-btn:hover {
  background: #f8f9fa;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #d8dde6;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

button:hover {
  background: #1d4ed8;
}

.error {
  margin-top: 1rem;
  color: #b91c1c;
}
</style>
