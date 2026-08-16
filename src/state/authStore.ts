import { create } from 'zustand';
import { User } from '../types';
import { secureStorage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setToken: async (token) => {
    if (token) {
      await secureStorage.setItem('auth_token', token);
    } else {
      await secureStorage.removeItem('auth_token');
    }
    set({ token });
  },

  logout: async () => {
    await secureStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
