import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'Auto' | 'Light' | 'Dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('Auto'); // Default to 'Auto'

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('subosity-theme') as Theme;
      if (savedTheme && ['Auto', 'Light', 'Dark'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subosity-theme', theme);
    }
  }, [theme]);

  // Apply the theme to the document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const themeValue = theme === 'Auto'
        ? (prefersDark ? 'dark' : 'light')
        : theme.toLowerCase();

      root.setAttribute('data-bs-theme', themeValue);
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
