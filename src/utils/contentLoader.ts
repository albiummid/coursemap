import type { Course, CourseTree, Lesson, LessonFrontmatter, LessonNavigation, Module, SearchItem } from '@/types';

/* ─── Load all content ─── */

// Lazy load markdown (heavy)
const markdownLoaders: Record<string, () => Promise<string>> = import.meta.glob(
  ['../../content/**/*.md', '../../repos/**/*.md'],
  { eager: false, query: '?raw', import: 'default' }
) as Record<string, () => Promise<string>>;

// Eager load JSON (light metadata)
const jsonFiles: Record<string, any> = import.meta.glob(
  ['../../content/**/*.json', '../../repos/**/*.json'],
  { eager: true, import: 'default' }
) as Record<string, any>;

/* ─── Lightweight Frontmatter Parser (browser-safe) ─── */

interface ParsedMarkdown {
  data: Record<string, any>;
  content: string;
}

function parseYamlFrontmatter(raw: string): ParsedMarkdown {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw.trim());
  if (!match) {
    return { data: {}, content: raw };
  }
  const yamlBlock = match[1] ?? '';
  const content = match[2] ?? '';
  const data: Record<string, any> = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: any = trimmed.slice(colonIdx + 1).trim();

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

    // Parse booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;

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

function parseFrontmatter(raw: string): { frontmatter: LessonFrontmatter; content: string } {
  const { data, content } = parseYamlFrontmatter(raw);
  return {
    frontmatter: {
      title: (data.title as string) ?? 'Untitled',
      slug: (data.slug as string) ?? 'untitled',
      order: (data.order as number) ?? 0,
      duration: (data.duration as string) ?? '5 min',
      tags: (data.tags as string[]) ?? [],
      description: (data.description as string) ?? '',
      videoUrl: data.videoUrl as string | undefined,
      playgroundLang: data.playgroundLang as string | undefined,
      playgroundCode: data.playgroundCode as string | undefined,
      isPublished: (data.isPublished as boolean) ?? true,
      isFree: (data.isFree as boolean) ?? false,
    },
    content: content.trim(),
  };
}

/* ─── Build the course tree ─── */

export function buildCourseTree(): CourseTree {
  const courseMap = new Map<string, Course>();
  const moduleMap = new Map<string, Map<string, Module>>();

  // 1. Process course.json files
  for (const [filePath, data] of Object.entries(jsonFiles)) {
    const courseMatch = filePath.match(/(?:content|repos)\/(.+?)\/course\.json$/);
    if (courseMatch) {
      const courseSlug = courseMatch[1]!;
      courseMap.set(courseSlug, {
        ...data,
        slug: courseSlug,
        modules: [],
      });
      moduleMap.set(courseSlug, new Map());
      continue;
    }
  }

  // 2. Process module.json files
  for (const [filePath, data] of Object.entries(jsonFiles)) {
    const moduleMatch = filePath.match(/(?:content|repos)\/(.+?)\/(.+?)\/module\.json$/);
    if (moduleMatch) {
      const [, courseSlug, moduleSlug] = moduleMatch;
      const courseModules = moduleMap.get(courseSlug!);
      if (courseModules) {
        courseModules.set(moduleSlug!, {
          ...data,
          slug: moduleSlug!,
          lessons: [],
        });
      }
      continue;
    }
  }

  // 3. Process markdown files (metadata only)
  for (const filePath of Object.keys(markdownLoaders)) {
    const pathMatch = filePath.match(/(?:content|repos)\/(.+?)\/(.+?)\/(.+?)\.md$/);
    if (!pathMatch) continue;

    const [, courseSlug, moduleSlug, lessonSlug] = pathMatch;
    
    // In a truly scalable system, we'd only parse frontmatter here.
    // For now, we'll store the path and metadata.
    const lesson: Lesson = {
      slug: lessonSlug!,
      path: `/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`,
      rawContent: '', // Empty initially
      content: '',    // Empty initially
      frontmatter: {
        title: slugify(lessonSlug!), // Fallback
        slug: lessonSlug!,
        order: 0,
        duration: '5 min',
        tags: [],
        description: '',
        isPublished: true,
      },
      moduleSlug: moduleSlug!,
      courseSlug: courseSlug!,
    };

    const courseModules = moduleMap.get(courseSlug!);
    if (courseModules) {
      const mod = courseModules.get(moduleSlug!);
      if (mod) {
        mod.lessons.push(lesson);
      }
    }
  }

  // Assemble the tree
  const finalCourses: Course[] = [];

  for (const [courseSlug, course] of courseMap) {
    const courseModules = moduleMap.get(courseSlug);
    if (courseModules) {
      const modules = Array.from(courseModules.values())
        .sort((a, b) => a.order - b.order)
        .map(mod => ({
          ...mod,
          lessons: mod.lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order)
        }));
      
      course.modules = modules;
    }
    finalCourses.push(course);
  }

  return { courses: finalCourses.sort((a, b) => a.title.localeCompare(b.title)) };
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

/* ─── Async Content Loader ─── */

export async function getLessonContent(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<{ frontmatter: LessonFrontmatter; content: string }> {
  // Find the loader
  const targetPathContent = `../../content/${courseSlug}/${moduleSlug}/${lessonSlug}.md`;
  const targetPathRepos = `../../repos/${courseSlug}/${moduleSlug}/${lessonSlug}.md`;
  
  const loader = markdownLoaders[targetPathContent] || markdownLoaders[targetPathRepos];

  if (!loader) {
    throw new Error(`Lesson not found: ${courseSlug}/${moduleSlug}/${lessonSlug}`);
  }

  const raw = await loader();
  return parseFrontmatter(raw);
}

/* ─── Singleton tree instance ─── */

let treeInstance: CourseTree | null = null;

export function getCourseTree(): CourseTree {
  if (!treeInstance) {
    treeInstance = buildCourseTree();
  }
  return treeInstance;
}
