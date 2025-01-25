import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import { useToast } from './ToastContext';

type Theme = 'Auto' | 'Light' | 'Dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'Auto';
  });

  // Load theme from database on login
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('preferences')
            .select('preference_value')
            .eq('preference_key', 'theme')
            .single();

          if (error) throw error;
          if (data) {
            setTheme(data.preference_value as Theme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      }
    };

    loadThemePreference();
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const themeValue = theme === 'Auto' 
        ? (prefersDark ? 'dark' : 'light')
        : theme.toLowerCase();
    
    console.log('Setting theme to:', themeValue); // Debug log
    root.setAttribute('data-bs-theme', themeValue);
    
    // Add debug logging for actual computed colors on navbar elements
    requestAnimationFrame(() => {
        const navbar = document.querySelector('.navbar');
        const navLink = document.querySelector('.nav-link');
        
        console.log('Theme Debug:', {
            theme: themeValue,
            cssVars: {
                navColor: getComputedStyle(root).getPropertyValue('--bs-navbar-color').trim(),
                navBg: getComputedStyle(root).getPropertyValue('--bs-navbar-bg').trim()
            },
            computedColors: navbar && navLink ? {
                navbarBg: getComputedStyle(navbar).backgroundColor,
                navLinkColor: getComputedStyle(navLink).color
            } : null
        });
    });
  }, [theme]);

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (user) {
      try {
        const { error } = await supabase
          .from('preferences')
          .update({ preference_value: newTheme })
          .eq('preference_key', 'theme');

        if (error) throw error;
        addToast('Theme preference saved', 'success');
      } catch (error) {
        console.error('Error saving theme preference:', error);
        addToast('Failed to save theme preference', 'error');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};