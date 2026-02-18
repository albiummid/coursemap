import type { Course, CourseTree, Lesson, LessonFrontmatter, LessonNavigation, Module, SearchItem } from '@/types';

/* ─── Load all markdown files eagerly ─── */

const markdownFiles: Record<string, string> = import.meta.glob(
  '../content/**/*.md',
  { eager: true, query: '?raw', import: 'default' }
) as Record<string, string>;

/* ─── Lightweight Frontmatter Parser (browser-safe) ─── */

interface ParsedMarkdown {
  data: Record<string, unknown>;
  content: string;
}

function parseYamlFrontmatter(raw: string): ParsedMarkdown {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw.trim());
  if (!match) {
    return { data: {}, content: raw };
  }
  const yamlBlock = match[1] ?? '';
  const content = match[2] ?? '';
  const data: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: unknown = trimmed.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if (typeof value === 'string' && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }

    // Parse arrays: ["a", "b", "c"]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1);
      value = inner
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter((s) => s.length > 0);
    }

    // Parse numbers
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    // Handle optional comment suffix (e.g., # optional)
    if (typeof value === 'string') {
      const commentIdx = value.indexOf('  #');
      if (commentIdx > -1) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    data[key] = value;
  }

  return { data, content };
}

/* ─── Helpers ─── */

function slugify(segment: string): string {
  return segment.replace(/\s+/g, '-').toLowerCase();
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function parseFrontmatter(raw: string): { frontmatter: LessonFrontmatter; content: string } {
  const { data, content } = parseYamlFrontmatter(raw);
  return {
    frontmatter: {
      title: (data.title as string) ?? 'Untitled',
      duration: (data.duration as string) ?? '5 min',
      order: (data.order as number) ?? 0,
      tags: (data.tags as string[]) ?? [],
      videoUrl: data.videoUrl as string | undefined,
      description: (data.description as string) ?? '',
    },
    content,
  };
}

/* ─── Build the course tree ─── */

export function buildCourseTree(): CourseTree {
  const courseMap = new Map<string, Map<string, Lesson[]>>();

  for (const [filePath, rawContent] of Object.entries(markdownFiles)) {
    // filePath looks like: ../content/react/module-1/lesson-1.md or similar
    // We want content/<course>/<module>/<lesson>.md
    const pathMatch = filePath.match(/content\/(.+?)\/(.+?)\/(.+?)\.md$/);
    if (!pathMatch) continue;

    const [, courseRaw, moduleRaw, lessonRaw] = pathMatch;
    const courseSlug = slugify(courseRaw!);
    const moduleSlug = slugify(moduleRaw!);
    const lessonSlug = slugify(lessonRaw!);
    
    const { frontmatter } = parseFrontmatter(rawContent);

    const lesson: Lesson = {
      slug: lessonSlug,
      path: `/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`,
      rawContent,
      frontmatter,
      moduleSlug,
      courseSlug,
    };

    if (!courseMap.has(courseSlug)) {
      courseMap.set(courseSlug, new Map());
    }
    const moduleMap = courseMap.get(courseSlug)!;
    if (!moduleMap.has(moduleSlug)) {
      moduleMap.set(moduleSlug, []);
    }
    moduleMap.get(moduleSlug)!.push(lesson);
  }

  const courses: Course[] = [];

  for (const [courseSlug, moduleMap] of courseMap) {
    const modules: Module[] = [];

    for (const [moduleSlug, lessons] of moduleMap) {
      const sortedLessons = lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
      const minOrder = sortedLessons[0]?.frontmatter.order ?? 0;

      modules.push({
        slug: moduleSlug,
        title: titleFromSlug(moduleSlug),
        order: minOrder,
        lessons: sortedLessons,
      });
    }

    modules.sort((a, b) => a.order - b.order);

    courses.push({
      slug: courseSlug,
      title: titleFromSlug(courseSlug),
      modules,
    });
  }

  courses.sort((a, b) => a.title.localeCompare(b.title));

  return { courses };
}

/* ─── Get a flat list of all lessons for a course ─── */

export function getAllLessons(tree: CourseTree, courseSlug?: string): Lesson[] {
  const lessons: Lesson[] = [];
  for (const course of tree.courses) {
    if (courseSlug && course.slug !== courseSlug) continue;
    for (const mod of course.modules) {
      lessons.push(...mod.lessons);
    }
  }
  return lessons;
}

/* ─── Get lesson by parameters ─── */

export function getLessonByParams(
  tree: CourseTree,
  courseSlug?: string,
  moduleSlug?: string,
  lessonSlug?: string
): Lesson | undefined {
  if (!courseSlug || !moduleSlug || !lessonSlug) return undefined;

  const course = tree.courses.find((c) => c.slug === courseSlug);
  if (!course) return undefined;

  const mod = course.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return undefined;

  return mod.lessons.find((l) => l.slug === lessonSlug);
}

/* ─── Get lesson by path ─── */

export function getLessonByPath(tree: CourseTree, path: string): Lesson | undefined {
  for (const course of tree.courses) {
    for (const mod of course.modules) {
      const found = mod.lessons.find((l) => l.path === path);
      if (found) return found;
    }
  }
  return undefined;
}

/* ─── Get prev/next lesson navigation ─── */

export function getLessonNavigation(tree: CourseTree, currentPath: string): LessonNavigation {
  const allLessons = getAllLessons(tree);
  const idx = allLessons.findIndex((l) => l.path === currentPath);
  return {
    prev: idx > 0 ? (allLessons[idx - 1] ?? null) : null,
    next: idx < allLessons.length - 1 ? (allLessons[idx + 1] ?? null) : null,
  };
}

/* ─── Build search items for Fuse.js ─── */

export function buildSearchItems(tree: CourseTree): SearchItem[] {
  const items: SearchItem[] = [];
  for (const course of tree.courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        items.push({
          title: lesson.frontmatter.title,
          description: lesson.frontmatter.description,
          tags: lesson.frontmatter.tags,
          path: lesson.path,
          moduleTitle: mod.title,
          courseSlug: course.slug,
        });
      }
    }
  }
  return items;
}

/* ─── Singleton tree instance ─── */

let treeInstance: CourseTree | null = null;

export function getCourseTree(): CourseTree {
  if (!treeInstance) {
    treeInstance = buildCourseTree();
  }
  return treeInstance;
}
