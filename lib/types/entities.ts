export interface Task {
  id: string;
  title: string;
  status: string;
  project_ids?: string[];
  project?: string;
  area?: string | null;
  priority: string;
  due?: string | null;
  scheduled?: string | null;
  energy?: string | null;
  effort?: string | null;
  tags: string[];
  created?: string | null;
  updated?: string;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  area?: string | null;
  due?: string | null;
  progress: number;
  lead?: string | null;
  tags: string[];
}

export interface Area {
  id: string;
  title: string;
  owner?: string | null;
  mission?: string | null;
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  type?: string | null;
  area?: string | null;
  project_ids?: string[];
  project?: string;
  tags: string[];
  updated?: string;
}

export interface Goal {
  id: string;
  title: string;
  horizon?: string | null;
  progress: number;
  area?: string | null;
  tags: string[];
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  last?: string | null;
  cadence?: string | null;
}

export interface Review {
  id: string;
  title: string;
  period?: string | null;
  mood?: string | null;
  highlights?: string | null;
  next?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start?: string | null;
  end?: string | null;
  related_ids?: string[];
  related?: string;
}

export interface Course {
  id: string;
  title: string;
  status: string;
  area?: string | null;
  progress: number;
  provider?: string | null;
  id_class?: string | null;
  tags: string[];
}

export interface Reading {
  id: string;
  title: string;
  type?: string | null;
  course?: string | null;
  status?: string | null;
  source?: string | null;
  tags: string[];
  due?: string | null;
}

export interface StudyNote {
  id: string;
  title: string;
  course?: string | null;
  reading?: string | null;
  concepts: string[];
  tags: string[];
  updated?: string;
}

export interface Resource {
  id: string;
  title: string;
  type?: string | null;
  link?: string | null;
  course?: string | null;
  tags: string[];
}

export interface Exam {
  id: string;
  title: string;
  course?: string | null;
  date?: string | null;
  weight: number;
  status?: string | null;
  tags: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back?: string | null;
  deck?: string | null;
  ease: number;
  interval: number;
  due?: string | null;
}

export interface StudySession {
  id: string;
  date?: string | null;
  duration: number;
  course?: string | null;
  topic?: string | null;
  notes?: string | null;
}

export interface Module {
  id: string;
  title?: string;
  status?: string | null;
  order?: number | null;
  course_ids?: string[];
  course?: string;
  lesson_ids?: string[];
  lessons?: string[];
}

export interface Lesson {
  id: string;
  title?: string;
  status?: string | null;
  order?: number | null;
  module_ids?: string[];
  module?: string;
  course_ids?: string[];
  course?: string;
}

export type EntityType =
  | 'tasks'
  | 'projects'
  | 'areas'
  | 'notes'
  | 'goals'
  | 'habits'
  | 'reviews'
  | 'calendar';

export type StudyEntityType =
  | 'courses'
  | 'readings'
  | 'study_notes'
  | 'resources'
  | 'exams'
  | 'flashcards'
  | 'sessions'
  | 'modules'
  | 'lessons';

export type AllEntityTypes = EntityType | StudyEntityType;

export interface StudiesData {
  courses: Course[];
  readings: Reading[];
  study_notes: StudyNote[];
  resources: Resource[];
  exams: Exam[];
  flashcards: Flashcard[];
  sessions: StudySession[];
  modules: Module[];
  lessons: Lesson[];
}

export interface EntityData {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  notes: Note[];
  goals: Goal[];
  habits: Habit[];
  reviews: Review[];
  calendar: CalendarEvent[];
}
