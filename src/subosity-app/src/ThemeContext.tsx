import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import { useToast } from './ToastContext';

type Theme = 'Auto' | 'Light' | 'Dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [theme, setTheme] = useState<Theme>('Auto'); // Start with a safe default

  const loadThemePreference = async () => {
    try {
      if (!user) {
        // Just get system default if no user
        const { data, error } = await supabase
          .from('preference_system_defaults')
          .select('preference_value')
          .eq('preference_key', 'Theme')
          .single();

        if (error) throw error;
        setTheme(data.preference_value as Theme);
        return;
      }

      // Get both system default and user preference if logged in
      const { data, error } = await supabase
        .from('preference_system_defaults')
        .select(`
          preference_value,
          preferences (
            preference_value
          )
        `)
        .eq('preference_key', 'Theme')
        .eq('preferences.owner', user.id)
        .single();

      if (error) throw error;

      // Use user's override if it exists, otherwise use system default
      const effectiveValue = data.preferences?.[0]?.preference_value ?? data.preference_value;
      setTheme(effectiveValue as Theme);
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Keep the current theme value if there's an error
    }
  };

  // Initial load
  useEffect(() => {
    loadThemePreference();
  }, [user]);

  // Apply the theme to the document
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const themeValue = theme === 'Auto'
      ? (prefersDark ? 'dark' : 'light')
      : theme.toLowerCase();

    root.setAttribute('data-bs-theme', themeValue);
  }, [theme]);

  const updateTheme = async (newTheme: Theme) => {
    if (!user) {
      setTheme(newTheme);
      return;
    }

    try {
      const { error } = await supabase
        .from('preferences')
        .upsert({
          owner: user.id,
          preference_key: 'Theme',
          preference_value: newTheme
        }, {
          onConflict: 'owner,preference_key'
        });

      if (error) throw error;

      setTheme(newTheme);
      addToast('Theme preference saved', 'success');
    } catch (error) {
      console.error('Error saving theme preference:', error);
      addToast('Failed to save theme preference', 'error');
    }
  };

  const applyTheme = async () => {
    try {
      if (!user) {
        const { data, error } = await supabase
          .from('preference_system_defaults')
          .select('preference_value')
          .eq('preference_key', 'Theme')
          .single();

        if (error) throw error;
        setTheme(data.preference_value as Theme);
        return;
      }

      const { data, error } = await supabase
        .from('preference_system_defaults')
        .select(`
          preference_value,
          preferences (
            preference_value
          )
        `)
        .eq('preference_key', 'Theme')
        .eq('preferences.owner', user.id)
        .single();

      if (error) throw error;

      const effectiveValue = data.preferences?.[0]?.preference_value ?? data.preference_value;
      setTheme(effectiveValue as Theme);
    } catch (error) {
      console.error('Error applying theme:', error);
      addToast('Failed to apply theme', 'error');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};