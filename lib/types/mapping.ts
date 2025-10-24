export interface PropsMapping {
  title?: string;
  status?: string;
  project?: string;
  area?: string;
  priority?: string;
  due?: string;
  scheduled?: string;
  energy?: string;
  effort?: string;
  tags?: string;
  created?: string;
  updated?: string;
  progress?: string;
  lead?: string;
  owner?: string;
  mission?: string;
  type?: string;
  horizon?: string;
  streak?: string;
  last?: string;
  cadence?: string;
  period?: string;
  mood?: string;
  highlights?: string;
  next?: string;
  start?: string;
  end?: string;
  related?: string;
  provider?: string;
  id_class?: string;
  course?: string;
  source?: string;
  reading?: string;
  concepts?: string;
  link?: string;
  date?: string;
  weight?: string;
  front?: string;
  back?: string;
  deck?: string;
  ease?: string;
  interval?: string;
  duration?: string;
  topic?: string;
  notes?: string;
  order?: string;
  module?: string;
  lessons?: string;
}

export interface StudiesPropsMapping {
  courses?: PropsMapping;
  readings?: PropsMapping;
  study_notes?: PropsMapping;
  resources?: PropsMapping;
  exams?: PropsMapping;
  flashcards?: PropsMapping;
  sessions?: PropsMapping;
  modules?: PropsMapping;
  lessons?: PropsMapping;
}

export interface StudiesDatabaseMapping {
  courses?: string;
  readings?: string;
  study_notes?: string;
  resources?: string;
  exams?: string;
  flashcards?: string;
  sessions?: string;
  modules?: string;
  lessons?: string;
}

export interface DatabaseMapping {
  tasks?: string;
  projects?: string;
  areas?: string;
  notes?: string;
  goals?: string;
  habits?: string;
  reviews?: string;
  calendar?: string;
  studies?: StudiesDatabaseMapping;
}

export interface MappingStore {
  db: DatabaseMapping;
  props: {
    tasks?: PropsMapping;
    projects?: PropsMapping;
    areas?: PropsMapping;
    notes?: PropsMapping;
    goals?: PropsMapping;
    habits?: PropsMapping;
    reviews?: PropsMapping;
    calendar?: PropsMapping;
    studies?: StudiesPropsMapping;
  };
}
