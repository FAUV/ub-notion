import { kv } from "@vercel/kv";
import { promises as fs } from "node:fs";
import path from "node:path";

export const DEFAULT_MAPPING = {
  db: {
    tasks: "",
    projects: "",
    areas: "",
    notes: "",
    goals: "",
    habits: "",
    reviews: "",
    calendar: "",
    studies: {
      courses: "",
      modules: "",
      lessons: "",
      readings: "",
      study_notes: "",
      resources: "",
      exams: "",
      flashcards: "",
      sessions: "",
    },
  },
  props: {
    tasks: {
      title: "Tarea",
      status: "Estado",
      project: "Proyecto",
      area: "Área",
      priority: "Prioridad",
      due: "Fecha límite",
      scheduled: "Programado",
      energy: "Energía",
      effort: "Esfuerzo",
      tags: "Tags",
      created: "Creado",
      updated: "Actualizado",
    },
    projects: {
      title: "Proyecto",
      status: "Estado",
      area: "Área",
      due: "Fecha objetivo",
      progress: "Progreso",
      lead: "Responsable",
      tags: "Tags",
    },
    areas: {
      title: "Área",
      owner: "Responsable",
      mission: "Misión",
      tags: "Tags",
    },
    notes: {
      title: "Título",
      type: "Tipo",
      area: "Área",
      project: "Proyecto",
      tags: "Tags",
      updated: "Actualizado",
    },
    goals: {
      title: "Objetivo",
      horizon: "Horizonte",
      progress: "Progreso",
      area: "Área",
      tags: "Tags",
    },
    habits: {
      title: "Hábito",
      streak: "Racha",
      last: "Última vez",
      cadence: "Cadencia",
    },
    reviews: {
      title: "Revisión",
      period: "Periodo",
      mood: "Estado",
      highlights: "Highlights",
      next: "Siguientes",
    },
    calendar: {
      title: "Evento",
      start: "Inicio",
      end: "Fin",
      related: "Relacionado",
    },
    studies: {
      courses: {
        title: "Curso",
        status: "Estado",
        area: "Área",
        progress: "Progreso",
        provider: "Proveedor",
        tags: "Tags",
      },
      modules: {
        title: "Módulo",
        status: "Estado",
        course: "Curso",
        order: "Orden",
      },
      readings: {
        title: "Lectura",
        type: "Tipo",
        course: "Curso",
        status: "Estado",
        source: "Fuente",
        tags: "Tags",
        due: "Para",
      },
      lessons: {
        title: "Lección",
        module: "Módulo",
        course: "Curso",
        status: "Estado",
        order: "Orden",
      },
      study_notes: {
        title: "Nota",
        course: "Curso",
        reading: "Lectura",
        concepts: "Conceptos",
        tags: "Tags",
        updated: "Actualizado",
      },
      resources: {
        title: "Recurso",
        type: "Tipo",
        link: "Enlace",
        course: "Curso",
        tags: "Tags",
      },
      exams: {
        title: "Evaluación",
        course: "Curso",
        date: "Fecha",
        weight: "Ponderación",
        status: "Estado",
        tags: "Tags",
      },
      flashcards: {
        front: "Frente",
        back: "Reverso",
        deck: "Baraja",
        ease: "Facilidad",
        interval: "Intervalo",
        due: "Revisión",
      },
      sessions: {
        date: "Fecha",
        duration: "Duración(min)",
        course: "Curso",
        topic: "Tema",
        notes: "Notas",
      },
    },
  },
} as const;

export type UltimateBrainMapping = typeof DEFAULT_MAPPING;

const LOCAL_MAPPING_FILE = path.join(process.cwd(), ".ub_mapping.json");
const KV_KEY = "ub:mapping";

function isKvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readLocalMapping(): Promise<UltimateBrainMapping | null> {
  try {
    const raw = await fs.readFile(LOCAL_MAPPING_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function writeLocalMapping(data: UltimateBrainMapping) {
  await fs.writeFile(LOCAL_MAPPING_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadMapping(options?: { fallbackToDefault?: boolean }): Promise<UltimateBrainMapping | null> {
  const fallbackToDefault = options?.fallbackToDefault ?? false;
  if (isKvConfigured()) {
    try {
      const remote = await kv.get<UltimateBrainMapping>(KV_KEY);
      if (remote && typeof remote === "object") {
        return remote;
      }
    } catch (error) {
      console.warn("Failed to load mapping from KV", error);
    }
  }

  const local = await readLocalMapping();
  if (local) return local;

  return fallbackToDefault ? (JSON.parse(JSON.stringify(DEFAULT_MAPPING)) as UltimateBrainMapping) : null;
}

export async function saveMapping(data: UltimateBrainMapping): Promise<boolean> {
  if (isKvConfigured()) {
    try {
      await kv.set(KV_KEY, data);
      if (!process.env.VERCEL) {
        try {
          await writeLocalMapping(data);
        } catch (error) {
          console.warn("Failed to mirror mapping locally", error);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to save mapping to KV", error);
      return false;
    }
  }

  try {
    await writeLocalMapping(data);
    return true;
  } catch (error) {
    console.error("Failed to save mapping locally", error);
    return false;
  }
}

const mappingStore = { loadMapping, saveMapping, DEFAULT_MAPPING };

export default mappingStore;
