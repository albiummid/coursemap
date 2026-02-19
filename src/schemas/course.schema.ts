import { z } from 'zod';

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
  language: z.string(),
  totalModules: z.number(),
  estimatedHours: z.number(),
  isPublished: z.boolean(),
  inviteOnly: z.boolean(),
  allowedEmails: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  order: z.number(),
  isLocked: z.boolean(),
  unlockAfterModuleId: z.string().nullable(),
  description: z.string(),
  coverImage: z.string().nullable().optional(),
});

export const LessonFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  order: z.number(),
  duration: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  videoUrl: z.string().optional(),
  playgroundLang: z.string().optional(),
  playgroundCode: z.string().optional(),
  isPublished: z.boolean(),
  isFree: z.boolean().optional(),
});
