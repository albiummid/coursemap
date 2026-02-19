import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStore } from '@/types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: 'user',
      isAuthenticated: false,
      login: (email, role) => {
        set({
          user: { id: '1', email, role },
          role,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({ user: null, role: 'user', isAuthenticated: false });
      },
    }),
    {
      name: 'lms:auth',
    }
  )
);
