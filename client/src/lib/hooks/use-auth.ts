import { create } from 'zustand';
import { apiRequest, queryClient } from '../queryClient';
import { useToast } from '@/hooks/use-toast';
import { StateCreator } from 'zustand';
import React, { ReactNode, createContext, useContext, useEffect } from 'react';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  setAuth: (user: User | null, token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set: (state: Partial<AuthState>) => void, get: () => AuthState) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (user: User | null, token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user, token, isAuthenticated: !!user, error: null });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      get().setAuth(data.user, data.token);
      // Invalidate any cached data that might be affected by login state
      await queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    } catch (error) {
      console.error('Login error:', error);
      set({ error: error instanceof Error ? error.message : 'Login failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/auth/register', { username, password });
      const data = await response.json();
      get().setAuth(data.user, data.token);
    } catch (error) {
      console.error('Registration error:', error);
      set({ error: error instanceof Error ? error.message : 'Registration failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      get().setAuth(null, null);
      // Invalidate any cached data that might be affected by login state
      await queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyToken: async () => {
    const token = get().token;
    if (!token) return false;

    set({ isLoading: true });
    try {
      const response = await apiRequest('GET', '/api/auth/verify');
      if (!response.ok) {
        get().setAuth(null, null);
        return false;
      }
      
      const data = await response.json();
      get().setAuth(data.user, token);
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      get().setAuth(null, null);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Create context for auth state
const AuthContext = createContext<ReturnType<typeof useAuthStore> | null>(null);

// Create AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthStore();
  
  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      await auth.verifyToken();
    };
    
    verifyAuth();
  }, []);
  
  return React.createElement(AuthContext.Provider, { value: auth }, children);
}

export function useAuth() {
  const context = useContext(AuthContext) as AuthState;
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { toast } = useToast();
  
  const enhancedLogin = async (username: string, password: string) => {
    try {
      await context.login(username, password);
      if (context.error) {
        toast({
          title: 'Login Failed',
          description: context.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${username}!`,
        });
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  const enhancedRegister = async (username: string, password: string) => {
    try {
      await context.register(username, password);
      if (context.error) {
        toast({
          title: 'Registration Failed',
          description: context.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: `Welcome, ${username}!`,
        });
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  const enhancedLogout = async () => {
    try {
      await context.logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };
  
  return {
    ...context,
    login: enhancedLogin,
    register: enhancedRegister,
    logout: enhancedLogout,
  };
}