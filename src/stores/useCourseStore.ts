import { create } from 'zustand';
import type { CourseStore } from '@/types';
import { useProgressStore } from './useProgressStore';

export const useCourseStore = create<CourseStore>((set, get) => ({
  courseTree: { courses: [] },
  activeCourse: null,
  activeLesson: null,
  setCourseTree: (tree) => set({ courseTree: tree }),
  setActiveCourse: (course) => set({ activeCourse: course }),
  setActiveLesson: (lesson) => set({ activeLesson: lesson }),
  isModuleUnlocked: (courseSlug, moduleId) => {
    const { courseTree } = get();
    const course = courseTree.courses.find((c) => c.slug === courseSlug);
    if (!course) return false;

    const module = course.modules.find((m) => m.id === moduleId);
    if (!module) return false;

    if (!module.isLocked) return true;
    if (!module.unlockAfterModuleId) return true;

    // Check if prerequisite module is completed
    const prereqModule = course.modules.find((m) => m.id === module.unlockAfterModuleId);
    if (!prereqModule) return true;

    const progressStore = useProgressStore.getState();
    const allLessonsCompleted = prereqModule.lessons.every((lesson) => 
      progressStore.isComplete(lesson.path)
    );

    return allLessonsCompleted;
  },
}));
