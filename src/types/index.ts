/* ─── Frontmatter Types ─── */

export interface LessonFrontmatter {
  title: string;
  duration: string;
  order: number;
  tags: string[];
  videoUrl?: string;
  description: string;
}

/* ─── Content Tree Types ─── */

export interface Lesson {
  slug: string;
  path: string;
  rawContent: string;
  frontmatter: LessonFrontmatter;
  moduleSlug: string;
  courseSlug: string;
}

export interface Module {
  slug: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  modules: Module[];
}

export interface CourseTree {
  courses: Course[];
}

export type ContentTree = CourseTree;

/* ─── Search Types ─── */

export interface SearchItem {
  title: string;
  description: string;
  tags: string[];
  path: string;
  moduleTitle: string;
  courseSlug: string;
}

export interface SearchResult {
  item: SearchItem;
  score?: number;
}

/* ─── Progress Store Types ─── */

export interface ProgressStore {
  completedLessons: Record<string, boolean>;
  lastVisited: string | null;
  toggleComplete: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  getCourseProgress: (lessons: string[]) => number;
  getModuleProgress: (lessons: string[]) => number;
  resetCourse: (courseId: string) => void;
}

/* ─── Theme Types ─── */

export type Theme = 'dark' | 'light';

export interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/* ─── Table of Contents Types ─── */

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/* ─── Navigation Types ─── */

export interface LessonNavigation {
  prev: Lesson | null;
  next: Lesson | null;
}
