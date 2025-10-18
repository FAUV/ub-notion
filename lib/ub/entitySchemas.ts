import { getDatabasePropertyTypes } from "@/lib/notionSchema";

type FieldType =
  | "title"
  | "rich_text"
  | "select"
  | "status"
  | "multi_select"
  | "date"
  | "relation"
  | "number"
  | "url";

type PrepareFn = (value: any) => any;

type FieldSpec = {
  input: string;
  prop: string;
  types: FieldType[];
  required?: boolean;
  prepare?: PrepareFn;
};

type EntitySpec = {
  fields: FieldSpec[];
};

type StudyCollections =
  | "courses"
  | "readings"
  | "study_notes"
  | "resources"
  | "exams"
  | "flashcards"
  | "sessions";

type EntityName =
  | "tasks"
  | "projects"
  | "areas"
  | "notes"
  | "goals"
  | "habits"
  | "reviews"
  | "calendar";

const arrayFrom = (value: any): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
};

const relationArray = (value: any): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const numberOrNull = (value: any): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const identity = (value: any) => value;

const ENTITY_SPECS: Record<EntityName, EntitySpec> = {
  tasks: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "status", prop: "status", types: ["select", "status"] },
      { input: "project_ids", prop: "project", types: ["relation"], prepare: relationArray },
      { input: "area", prop: "area", types: ["select", "status"] },
      { input: "priority", prop: "priority", types: ["select", "status"] },
      { input: "due", prop: "due", types: ["date"] },
      { input: "scheduled", prop: "scheduled", types: ["date"] },
      { input: "energy", prop: "energy", types: ["select", "status"] },
      { input: "effort", prop: "effort", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  projects: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "status", prop: "status", types: ["select", "status"] },
      { input: "area", prop: "area", types: ["select", "status"] },
      { input: "due", prop: "due", types: ["date"] },
      { input: "progress", prop: "progress", types: ["number"], prepare: numberOrNull },
      { input: "lead", prop: "lead", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  areas: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "owner", prop: "owner", types: ["select", "status"] },
      { input: "mission", prop: "mission", types: ["rich_text", "title"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  notes: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "type", prop: "type", types: ["select", "status"] },
      { input: "area", prop: "area", types: ["select", "status"] },
      { input: "project_ids", prop: "project", types: ["relation"], prepare: relationArray },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  goals: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "horizon", prop: "horizon", types: ["select", "status"] },
      { input: "progress", prop: "progress", types: ["number"], prepare: numberOrNull },
      { input: "area", prop: "area", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  habits: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "streak", prop: "streak", types: ["number"], prepare: numberOrNull },
      { input: "last", prop: "last", types: ["date"] },
      { input: "cadence", prop: "cadence", types: ["select", "status"] },
    ],
  },
  reviews: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "period", prop: "period", types: ["rich_text", "title"] },
      { input: "mood", prop: "mood", types: ["select", "status"] },
      { input: "highlights", prop: "highlights", types: ["rich_text", "title"] },
      { input: "next", prop: "next", types: ["rich_text", "title"] },
    ],
  },
  calendar: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "start", prop: "start", types: ["date"], required: true },
      { input: "end", prop: "end", types: ["date"] },
      { input: "related_ids", prop: "related", types: ["relation"], prepare: relationArray },
    ],
  },
};

const STUDY_SPECS: Record<StudyCollections, EntitySpec> = {
  courses: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "status", prop: "status", types: ["select", "status"] },
      { input: "area", prop: "area", types: ["select", "status"] },
      { input: "progress", prop: "progress", types: ["number"], prepare: numberOrNull },
      { input: "provider", prop: "provider", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  readings: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "type", prop: "type", types: ["select", "status"] },
      { input: "course", prop: "course", types: ["select", "status", "relation"] },
      { input: "status", prop: "status", types: ["select", "status"] },
      { input: "source", prop: "source", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
      { input: "due", prop: "due", types: ["date"] },
    ],
  },
  study_notes: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "course", prop: "course", types: ["select", "status", "relation"] },
      { input: "reading", prop: "reading", types: ["select", "status", "relation"] },
      { input: "concepts", prop: "concepts", types: ["multi_select"], prepare: arrayFrom },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  resources: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "type", prop: "type", types: ["select", "status"] },
      { input: "link", prop: "link", types: ["url", "rich_text"] },
      { input: "course", prop: "course", types: ["select", "status", "relation"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  exams: {
    fields: [
      { input: "title", prop: "title", types: ["title"], required: true },
      { input: "course", prop: "course", types: ["select", "status", "relation"] },
      { input: "date", prop: "date", types: ["date"] },
      { input: "weight", prop: "weight", types: ["number"], prepare: numberOrNull },
      { input: "status", prop: "status", types: ["select", "status"] },
      { input: "tags", prop: "tags", types: ["multi_select"], prepare: arrayFrom },
    ],
  },
  flashcards: {
    fields: [
      { input: "front", prop: "front", types: ["rich_text", "title"], required: true },
      { input: "back", prop: "back", types: ["rich_text", "title"], required: true },
      { input: "deck", prop: "deck", types: ["select", "status"] },
      { input: "ease", prop: "ease", types: ["number"], prepare: numberOrNull },
      { input: "interval", prop: "interval", types: ["number"], prepare: numberOrNull },
      { input: "due", prop: "due", types: ["date"] },
    ],
  },
  sessions: {
    fields: [
      { input: "date", prop: "date", types: ["date"], required: true },
      { input: "duration", prop: "duration", types: ["number"], prepare: numberOrNull },
      { input: "course", prop: "course", types: ["select", "status", "relation"] },
      { input: "topic", prop: "topic", types: ["rich_text", "title"] },
      { input: "notes", prop: "notes", types: ["rich_text", "title"] },
    ],
  },
};

const builderByType: Record<FieldType, (value: any) => any> = {
  title: (value: string) => ({
    title: [
      {
        type: "text",
        text: { content: value ?? "" },
      },
    ],
  }),
  rich_text: (value: string) => ({
    rich_text: value
      ? [
          {
            type: "text",
            text: { content: value },
          },
        ]
      : [],
  }),
  select: (value: string | null) => ({ select: value ? { name: value } : null }),
  status: (value: string | null) => ({ status: value ? { name: value } : null }),
  multi_select: (value: string[]) => ({ multi_select: (value || []).map((name) => ({ name })) }),
  date: (value: any) => {
    if (!value) return { date: null };
    if (typeof value === "string") return { date: { start: value || null } };
    if (typeof value === "object") {
      const start = value.start ?? value.from ?? null;
      const end = value.end ?? value.to ?? null;
      if (!start && !end) return { date: null };
      return { date: { start: start || null, end: end || null } };
    }
    return { date: null };
  },
  relation: (value: string[]) => ({ relation: (value || []).map((id) => ({ id })) }),
  number: (value: number | null) => ({ number: value ?? null }),
  url: (value: string | null) => ({ url: value ?? null }),
};

function isEffectivelyEmpty(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function buildFromSpec(
  spec: EntitySpec,
  dbId: string,
  propsMap: Record<string, string>,
  input: Record<string, any>,
  mode: "create" | "update"
) {
  const schema = await getDatabasePropertyTypes(dbId);
  const output: Record<string, any> = {};
  for (const field of spec.fields) {
    const propertyName = propsMap?.[field.prop];
    if (!propertyName) continue;
    if (!(field.input in input) && mode === "update") continue;
    const raw = input[field.input];
    if (raw === undefined) {
      if (mode === "create" && field.required) throw new Error(`Missing field ${field.input}`);
      continue;
    }
    const prepared = field.prepare ? field.prepare(raw) : identity(raw);
    if (mode === "create" && field.required && isEffectivelyEmpty(prepared)) {
      throw new Error(`Missing field ${field.input}`);
    }
    if (prepared === undefined) continue;
    const schemaType = schema[propertyName];
    const candidateType = schemaType && field.types.includes(schemaType as FieldType) ? (schemaType as FieldType) : field.types[0];
    const builder = builderByType[candidateType];
    if (!builder) continue;
    output[propertyName] = builder(prepared);
  }
  return output;
}

export async function buildEntityProperties(
  entity: EntityName,
  dbId: string,
  propsMap: Record<string, string>,
  input: Record<string, any>,
  mode: "create" | "update"
) {
  const spec = ENTITY_SPECS[entity];
  if (!spec) return {};
  return await buildFromSpec(spec, dbId, propsMap, input, mode);
}

export async function buildStudyProperties(
  collection: StudyCollections,
  dbId: string,
  propsMap: Record<string, string>,
  input: Record<string, any>,
  mode: "create" | "update"
) {
  const spec = STUDY_SPECS[collection];
  if (!spec) return {};
  return await buildFromSpec(spec, dbId, propsMap, input, mode);
}

export type { EntityName, StudyCollections };
