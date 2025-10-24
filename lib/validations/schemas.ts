import { z } from 'zod';

const isoDateString = z.string().datetime().nullable().optional();
const nonEmptyString = z.string().min(1, 'Este campo es requerido');

export const taskSchema = z.object({
  title: nonEmptyString,
  status: z.string().optional(),
  project: z.array(z.string()).optional(),
  area: z.string().nullable().optional(),
  priority: z.string().optional(),
  due: isoDateString,
  scheduled: isoDateString,
  energy: z.string().nullable().optional(),
  effort: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const projectSchema = z.object({
  title: nonEmptyString,
  status: z.string().optional(),
  area: z.string().nullable().optional(),
  due: isoDateString,
  progress: z.number().min(0).max(100).optional(),
  lead: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const areaSchema = z.object({
  title: nonEmptyString,
  owner: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const noteSchema = z.object({
  title: nonEmptyString,
  type: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  project: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const goalSchema = z.object({
  title: nonEmptyString,
  horizon: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  area: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const habitSchema = z.object({
  title: nonEmptyString,
  streak: z.number().min(0).optional(),
  last: isoDateString,
  cadence: z.string().nullable().optional(),
});

export const reviewSchema = z.object({
  title: nonEmptyString,
  period: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  highlights: z.string().nullable().optional(),
  next: z.string().nullable().optional(),
});

export const calendarEventSchema = z.object({
  title: nonEmptyString,
  start: isoDateString,
  end: isoDateString,
  related: z.array(z.string()).optional(),
});

export const courseSchema = z.object({
  title: nonEmptyString,
  status: z.string().optional(),
  area: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  provider: z.string().nullable().optional(),
  id_class: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const readingSchema = z.object({
  title: nonEmptyString,
  type: z.string().nullable().optional(),
  course: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  due: isoDateString,
});

export const studyNoteSchema = z.object({
  title: nonEmptyString,
  course: z.string().nullable().optional(),
  reading: z.string().nullable().optional(),
  concepts: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const resourceSchema = z.object({
  title: nonEmptyString,
  type: z.string().nullable().optional(),
  link: z.string().url('URL inválida').nullable().optional(),
  course: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const examSchema = z.object({
  title: nonEmptyString,
  course: z.string().nullable().optional(),
  date: isoDateString,
  weight: z.number().min(0).max(100).optional(),
  status: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const flashcardSchema = z.object({
  front: nonEmptyString,
  back: z.string().nullable().optional(),
  deck: z.string().nullable().optional(),
  ease: z.number().min(1.3).max(4.0).optional(),
  interval: z.number().min(0).optional(),
  due: isoDateString,
});

export const studySessionSchema = z.object({
  date: isoDateString,
  duration: z.number().min(0).optional(),
  course: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const moduleSchema = z.object({
  title: z.string().optional(),
  status: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  course: z.array(z.string()).optional(),
  lessons: z.array(z.string()).optional(),
});

export const lessonSchema = z.object({
  title: z.string().optional(),
  status: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  module: z.array(z.string()).optional(),
  course: z.array(z.string()).optional(),
});

export const filterConfigSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  customFilters: z.record(z.string(), z.any()).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  timezone: z.string().default('America/Santiago'),
  default_view: z.string().default('dashboard'),
  notifications_enabled: z.boolean().default(true),
});

export const dashboardLayoutSchema = z.object({
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.string(), z.any()),
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    }),
  })),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type AreaInput = z.infer<typeof areaSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ReadingInput = z.infer<typeof readingSchema>;
export type StudyNoteInput = z.infer<typeof studyNoteSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type FlashcardInput = z.infer<typeof flashcardSchema>;
export type StudySessionInput = z.infer<typeof studySessionSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type FilterConfig = z.infer<typeof filterConfigSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
