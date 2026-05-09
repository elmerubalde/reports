import { computed } from 'vue';

export interface AuthUser {
  id: number;
  username: string;
  emailAddress: string;
  churchGroupId: number;
  roles: string[];
  personId: number;
  churchName: string;
  tribeId: number;
  accessToken: string;
}

const STORAGE_KEY = "newcms-auth-user";

export const useAuth = () => {
  const auth = useState<AuthUser | null>("authUser", () => null);
  const token = useState<string | null>("authToken", () => null);
  const config = useRuntimeConfig();

  const loadFromStorage = () => {
    if (process.client) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AuthUser;
          auth.value = parsed;
          token.value = parsed.accessToken;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  };

  if (process.client && !token.value) {
    loadFromStorage();
  }

  const saveToStorage = (user: AuthUser) => {
    auth.value = user;
    token.value = user.accessToken;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  };

  const clearStorage = () => {
    auth.value = null;
    token.value = null;
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const signIn = async (username: string, password: string) => {
    const data = await $fetch<AuthUser>(`${config.public.apiBase}/api/auth/signin`, {
      method: "POST",
      body: { username, password }
    });
    saveToStorage(data);
    return data;
  };

  const signInWithGoogle = async (googleToken: string) => {
    const data = await $fetch<AuthUser>(`${config.public.apiBase}/api/googleauth/signin`, {
      method: "POST",
      body: { token: googleToken }
    });
    saveToStorage(data);
    return data;
  };

  const signOut = () => {
    clearStorage();
  };

  const apiFetch = async <T = any>(path: string, options: Record<string, any> = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    console.log(path);

    if (token.value) {
      headers['X-Access-Token'] = `${token.value}`;
    }
 
    return await $fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers
    });
  };

  return {
    auth,
    token,
    isLoggedIn: computed(() => !!token.value),
    signIn,
    signInWithGoogle,
    signOut,
    apiFetch
  };
};
