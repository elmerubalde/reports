<template>

  <main class="login-page"> 
    
    <section class="login-card">
      <h1>Login to JIL CMS</h1>
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

      <!-- Official Google Sign-In Button -->
      <div ref="googleButtonRef" class="google-button-container" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "nuxt/app";
import { useAuth } from "../composables/useAuth";

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
const googleReady = ref(false);
const googleButtonRef = ref<HTMLElement | null>(null);
const submit = async () => {
  error.value = "";

  try {
    await auth.signIn(username.value.trim(), password.value);
    await router.push("/summary");
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "Login failed. Please check your credentials.";
    }
  }
};

const signInWithGoogle = async () => {
  if (!window.google) {
    error.value = "Google Identity script not loaded yet. Please refresh the page.";
    return;
  }
  window.google.accounts.id.initialize({
    client_id: runtimeConfig.public.googleClientId,
    callback: handleCredentialResponse,
    auto_prompt: false
  });
  window.google.accounts.id.prompt();
};

const initializeGoogle = () => {
  // Check if script already exists
  if (document.querySelector('script[src*="gsi/client"]')) {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: runtimeConfig.public.googleClientId,
          callback: handleCredentialResponse,
          auto_prompt: false
        });
        // Render the button
        if (googleButtonRef.value) {
          window.google.accounts.id.renderButton(
            googleButtonRef.value,
            {
              theme: "outline",
              size: "large"
            }
          );
        }
        googleReady.value = true;
      } catch (e) {
        console.error("Google initialize error:", e);
      }
    }
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = false;
  script.onload = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: runtimeConfig.public.googleClientId,
        callback: handleCredentialResponse,
        auto_prompt: false
      });
      // Render the button
      if (googleButtonRef.value) {
        window.google.accounts.id.renderButton(
          googleButtonRef.value,
          {
            theme: "outline",
            size: "large"
          }
        );
      }
      googleReady.value = true;
    } catch (e) {
      console.error("Google initialize error after load:", e);
    }
  };
  document.head.appendChild(script);
};

const handleCredentialResponse = async (response: any) => {
  console.log(response)
  try {
    await auth.signInWithGoogle(response.credential);
    await router.push("/summary");
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "Google login failed.";
    }
  }
};

onMounted(() => {
  // Initialize Google Identity Services (load script if needed)
  initializeGoogle();
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
