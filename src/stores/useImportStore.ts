import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImportStore } from '@/types';

export const useImportStore = create<ImportStore>()(
  persist(
    (set) => ({
      importQueue: [],
      importStatus: 'idle',
      importHistory: [],
      addHistory: (item) => {
        set((state) => ({
          importHistory: [item, ...state.importHistory].slice(0, 20),
        }));
      },
    }),
    {
      name: 'lms:import',
    }
  )
);
