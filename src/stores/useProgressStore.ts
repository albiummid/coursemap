import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressStore } from '@/types';

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      lastVisited: null,

      toggleComplete: (lessonPath: string): void => {
        set((state) => {
          const updated = { ...state.completedLessons };
          if (updated[lessonPath]) {
            delete updated[lessonPath];
          } else {
            updated[lessonPath] = true;
          }
          return { completedLessons: updated };
        });
      },

      isComplete: (lessonPath: string): boolean => {
        return get().completedLessons[lessonPath] === true;
      },

      getCourseProgress: (lessonIds: string[]): number => {
        if (lessonIds.length === 0) return 0;
        const completedCount = lessonIds.filter((id) => get().isComplete(id)).length;
        return Math.round((completedCount / lessonIds.length) * 100);
      },

      getModuleProgress: (lessonIds: string[]): number => {
        if (lessonIds.length === 0) return 0;
        const completedCount = lessonIds.filter((id) => get().isComplete(id)).length;
        return Math.round((completedCount / lessonIds.length) * 100);
      },

      resetCourse: (courseSlug: string): void => {
        set((state) => {
          const updated = { ...state.completedLessons };
          for (const key of Object.keys(updated)) {
            if (key.includes(`/courses/${courseSlug}/`)) {
              delete updated[key];
            }
          }
          return { completedLessons: updated };
        });
      },
    }),
    {
      name: 'lms:progress',
    }
  )
);

