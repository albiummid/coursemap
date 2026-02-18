import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressStore } from '@/types';

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      lastVisited: null,

      toggleComplete: (lessonId: string): void => {
        set((state) => {
          const updated = { ...state.completedLessons };
          if (updated[lessonId]) {
            delete updated[lessonId];
          } else {
            updated[lessonId] = true;
          }
          return { completedLessons: updated };
        });
      },

      isComplete: (lessonId: string): boolean => {
        return get().completedLessons[lessonId] === true;
      },

      getCourseProgress: (lessonIds: string[]): number => {
        if (lessonIds.length === 0) return 0;
        const completed = lessonIds.filter(
          (id) => get().completedLessons[id] === true
        ).length;
        return Math.round((completed / lessonIds.length) * 100);
      },

      getModuleProgress: (lessonIds: string[]): number => {
        if (lessonIds.length === 0) return 0;
        const completed = lessonIds.filter(
          (id) => get().completedLessons[id] === true
        ).length;
        return Math.round((completed / lessonIds.length) * 100);
      },

      resetCourse: (courseId: string): void => {
        set((state) => {
          const updated = { ...state.completedLessons };
          for (const key of Object.keys(updated)) {
            if (key.startsWith(courseId)) {
              delete updated[key];
            }
          }
          return { completedLessons: updated };
        });
      },
    }),
    {
      name: 'coursemap-progress',
    }
  )
);
