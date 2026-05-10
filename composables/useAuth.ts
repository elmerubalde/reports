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
  const apiCache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    const cacheKey = `${path}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token.value) {
      headers['X-Access-Token'] = `${token.value}`;
    }
 
    const result = await $fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers
    });

    // Store in cache
    apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  };

  const clearApiCache = () => {
    apiCache.clear();
  };

  const apiMultiFetch = async <T = any>(paths: string[]) => {
    return await Promise.all(paths.map((path) => apiFetch<T>(path)));
  }

  return {
    auth,
    token,
    isLoggedIn: computed(() => !!token.value),
    signIn,
    signInWithGoogle,
    signOut,
    apiFetch,
    apiMultiFetch,
    clearApiCache
  };
};
