import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeStore } from '@/types';

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      toggleTheme: (): void => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },

      setTheme: (theme): void => {
        set({ theme });
      },
    }),
    {
      name: 'coursemap-theme',
    }
  )
);
