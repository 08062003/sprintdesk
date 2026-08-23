import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Simulated local storage for theme
const themeStorage = {
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
};

const STORAGE_KEY = 'sprintdesk_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  
  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    themeStorage.setItem(STORAGE_KEY, newTheme);
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  },
  
  setTheme: (theme: Theme) => {
    set({ theme });
    themeStorage.setItem(STORAGE_KEY, theme);
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },
}));

// Initialize theme from storage on load
const storedTheme = themeStorage.getItem(STORAGE_KEY) as Theme | null;
if (storedTheme) {
  useThemeStore.getState().setTheme(storedTheme);
} else {
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    useThemeStore.getState().setTheme('dark');
  }
}
