/* ─── Frontmatter Types ─── */

export interface LessonFrontmatter {
  title: string;
  slug: string;
  order: number;
  duration: string;
  tags: string[];
  description: string;
  videoUrl?: string;
  playgroundLang?: string;
  playgroundCode?: string;
  isPublished: boolean;
  isFree?: boolean;
}

/* ─── Content Tree Types ─── */

export interface CourseMetadata {
  id: string;
  title: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  coverImage?: string;
  tags: string[];
  language: string;
  totalModules: number;
  estimatedHours: number;
  isPublished: boolean;
  inviteOnly: boolean;
  allowedEmails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleMetadata {
  id: string;
  title: string;
  slug: string;
  order: number;
  isLocked: boolean;
  unlockAfterModuleId: string | null;
  description: string;
  coverImage?: string | null;
}

export interface Lesson {
  slug: string;
  path: string;
  rawContent: string;
  frontmatter: LessonFrontmatter;
  moduleSlug: string;
  courseSlug: string;
  content: string;
}

export interface Module extends ModuleMetadata {
  lessons: Lesson[];
}

export interface Course extends CourseMetadata {
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

/* ─── Auth Store Types ─── */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthStore {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

/* ─── Progress Store Types ─── */

export interface ProgressStore {
  completedLessons: Record<string, boolean>; // lesson path -> completed
  lastVisited: string | null; // lesson path
  toggleComplete: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  getCourseProgress: (lessonIds: string[]) => number;
  getModuleProgress: (lessonIds: string[]) => number;
  resetCourse: (courseSlug: string) => void;
}

/* ─── Playground Store Types ─── */

export interface RunResult {
  type: 'log' | 'warn' | 'error' | 'info' | 'table';
  content: any[];
  timestamp: number;
}

export interface PlaygroundStore {
  isOpen: boolean;
  activeLanguage: string;
  code: Record<string, string>; // lang -> code
  history: RunResult[];
  open: (opts?: { lang?: string; code?: string }) => void;
  close: () => void;
  setCode: (lang: string, code: string) => void;
  clearHistory: () => void;
  addHistory: (result: RunResult) => void;
}

/* ─── Import Store Types ─── */

export interface ImportHistoryItem {
  id: string;
  courseTitle: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export interface ImportStore {
  importQueue: string[];
  importStatus: 'idle' | 'processing' | 'success' | 'error';
  importHistory: ImportHistoryItem[];
  addHistory: (item: ImportHistoryItem) => void;
}

/* ─── UI Store Types ─── */

export interface UIStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  searchOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

/* ─── Course Store Types ─── */

export interface CourseStore {
  courseTree: CourseTree;
  activeCourse: Course | null;
  activeLesson: Lesson | null;
  setCourseTree: (tree: CourseTree) => void;
  setActiveCourse: (course: Course | null) => void;
  setActiveLesson: (lesson: Lesson | null) => void;
  isModuleUnlocked: (courseSlug: string, moduleId: string) => boolean;
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

