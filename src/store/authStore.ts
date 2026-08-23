import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; username: string; email: string; firstName: string; lastName: string; image: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  revalidateSession: () => Promise<void>;
  setUser: (user: any) => void;
}

// Simulated local storage for refresh token
const simulatedLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  }
};

const STORAGE_KEYS = {
  REFRESH_TOKEN: 'sprintdesk_refresh_token',
  REMEMBER_ME: 'sprintdesk_remember_me'
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  rememberMe: false,

  login: async (username: string, password: string, rememberMe: boolean) => {
    set({ isLoading: true });
    
    try {
      // Prepare payload matching common auth APIs (DummyJSON expects username and password)
      const payload: Record<string, any> = { username, password };

      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to surface backend message if present
        let errText = 'Authentication failed';
        try {
          const errBody = await response.json();
          if (errBody && errBody.message) errText = String(errBody.message);
        } catch (_) {
          // ignore parse errors
        }
        throw new Error(errText);
      }

      const data = await response.json();

      // Normalize token fields from different backends (token, accessToken, authToken)
      const accessToken = data.accessToken || data.token || data.authToken || null;
      const refreshToken = data.refreshToken || null;

      // Store refresh token in simulated local storage if remember me is checked
      if (rememberMe && refreshToken) {
        simulatedLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        simulatedLocalStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        simulatedLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        simulatedLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

      // Normalize user object: some APIs return user inside data.user
      const user = data.user || data;

      set({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken: rememberMe ? refreshToken : null,
        rememberMe,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear tokens from storage
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false
    });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    const { rememberMe } = get();

  if (rememberMe && refreshToken) {
      simulatedLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    set({ accessToken, refreshToken });
  },

  clearTokens: () => {
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    set({ accessToken: null, refreshToken: null });
  },

  setUser: (user: any) => {
    set({ user });
  },

  revalidateSession: async () => {
    set({ isLoading: true });

    try {
      const rememberMe = simulatedLocalStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      const storedRefreshToken = simulatedLocalStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (rememberMe && storedRefreshToken) {
        // Try to refresh the token
        const response = await fetch('https://dummyjson.com/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();

        const accessToken = data.accessToken || data.token || null;
        const refreshToken = data.refreshToken || null;
        const user = data.user || data;

        set({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          rememberMe: true,
          isLoading: false,
        });

        // Update stored refresh token
        if (refreshToken) simulatedLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        return;
      }
    }

    // If refresh fails or no remember me, clear session
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isLoading: false,
    });
  } catch (error) {
    // On error, clear session
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    simulatedLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isLoading: false,
    });
  }
  }
}));
