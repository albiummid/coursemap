import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIStore } from '@/types';

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarOpen: true,
      searchOpen: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
    }),
    {
      name: 'lms:ui',
    }
  )
);
