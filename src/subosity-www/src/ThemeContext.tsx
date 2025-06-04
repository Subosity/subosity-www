import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'Auto' | 'Light' | 'Dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('Auto'); // Default to 'Auto'
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('subosity-theme') as Theme;
      if (savedTheme && ['Auto', 'Light', 'Dark'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('subosity-theme', theme);
    }
  }, [theme, isInitialized]);

  // Apply the theme to the document (sync with SSR script)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      const root = document.documentElement;
      const body = document.body;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const themeValue = theme === 'Auto'
        ? (prefersDark ? 'dark' : 'light')
        : theme.toLowerCase();

      // Set both html and body attributes for consistency
      root.setAttribute('data-bs-theme', themeValue);
      body.setAttribute('data-bs-theme', themeValue);
      root.className = `${themeValue}-theme`;

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('themeChange', { 
        detail: { theme: themeValue, source: 'react' } 
      }));
    }
  }, [theme, isInitialized]);

  // Listen for system theme changes when in Auto mode
  useEffect(() => {
    if (typeof window !== 'undefined' && theme === 'Auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'Auto') {
          const root = document.documentElement;
          const body = document.body;
          const themeValue = e.matches ? 'dark' : 'light';
          
          root.setAttribute('data-bs-theme', themeValue);
          body.setAttribute('data-bs-theme', themeValue);
          root.className = `${themeValue}-theme`;
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
