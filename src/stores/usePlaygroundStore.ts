import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaygroundStore } from '@/types';

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      isOpen: false,
      activeLanguage: 'javascript',
      code: {
        javascript: '// Write your JavaScript here\nconsole.log("Hello, World!");',
      },
      history: [],
      open: (opts) => {
        set((state) => ({
          isOpen: true,
          activeLanguage: opts?.lang ?? state.activeLanguage,
          code: opts?.code 
            ? { ...state.code, [opts.lang ?? state.activeLanguage]: opts.code }
            : state.code,
        }));
      },
      close: () => set({ isOpen: false }),
      setCode: (lang, code) => {
        set((state) => ({
          code: { ...state.code, [lang]: code },
        }));
      },
      clearHistory: () => set({ history: [] }),
      addHistory: (result) => {
        set((state) => ({
          history: [...state.history, result].slice(-50), // Keep last 50
        }));
      },
    }),
    {
      name: 'lms:playground',
    }
  )
);
