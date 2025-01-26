import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { useToast } from './ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  requireAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isValidReturnUrl = (url: string): boolean => {
    try {
      const returnUrl = new URL(url, window.location.origin);
      const hostname = returnUrl.hostname.toLowerCase();
      
      return hostname === 'localhost' ||
             hostname === '127.0.0.1' ||
             hostname.endsWith('.subosity.com') ||
             // If it's a relative URL (no hostname), it's valid
             returnUrl.origin === window.location.origin;
    } catch {
      // If URL parsing fails, check if it's a relative path
      return url.startsWith('/') && !url.startsWith('//');
    }
  };

  const requireAuth = () => {
    if (!user) {
      const returnUrl = encodeURIComponent(
        `${location.pathname}${location.search}${location.hash}`
      );
      
      // Only redirect if it's a valid URL
      if (isValidReturnUrl(returnUrl)) {
        addToast('Please log in to access this page', 'info');
        navigate(`/login?returnUrl=${returnUrl}`);
      } else {
        // If invalid URL, redirect to login without return URL
        addToast('Please log in to continue', 'info');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Handle returnUrl after successful login
      if (session?.user && location.pathname === '/login') {
        const params = new URLSearchParams(location.search);
        const returnUrl = params.get('returnUrl');
        
        if (returnUrl && isValidReturnUrl(decodeURIComponent(returnUrl))) {
          //console.log('Redirecting to:', decodeURIComponent(returnUrl));
          navigate(decodeURIComponent(returnUrl));
        } else {
          //console.log('No valid returnUrl, going to home');
          navigate('/');
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
    addToast('You have been logged out', 'success');
  };

  return (
    <AuthContext.Provider value={{ user, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
};