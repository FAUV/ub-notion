import { NextResponse } from "next/server";
import { readFromFile, writeToFile } from "@/lib/mappingStore";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

const DEFAULT_MAPPING = {
  db: {
    tasks: "", projects: "", areas: "", notes: "", goals: "",
    habits: "", reviews: "", calendar: "",
    studies: { courses: "", readings: "", study_notes: "", resources: "", exams: "", flashcards: "", sessions: "" },
  },
  props: {
    tasks: { title: "Tarea", status: "Estado", project: "Proyecto", area: "Área", priority: "Prioridad", due: "Fecha límite", scheduled: "Programado", energy: "Energía", effort: "Esfuerzo", tags: "Tags", created: "Creado", updated: "Actualizado" },
    projects: { title: "Proyecto", status: "Estado", area: "Área", due: "Fecha objetivo", progress: "Progreso", lead: "Responsable", tags: "Tags" },
    areas: { title: "Área", owner: "Responsable", mission: "Misión", tags: "Tags" },
    notes: { title: "Título", type: "Tipo", area: "Área", project: "Proyecto", tags: "Tags", updated: "Actualizado" },
    goals: { title: "Objetivo", horizon: "Horizonte", progress: "Progreso", area: "Área", tags: "Tags" },
    habits: { title: "Hábito", streak: "Racha", last: "Última vez", cadence: "Cadencia" },
    reviews: { title: "Revisión", period: "Periodo", mood: "Estado", highlights: "Highlights", next: "Siguientes" },
    calendar: { title: "Evento", start: "Inicio", end: "Fin", related: "Relacionado" },
    studies: {
      courses: { title: "Curso", status: "Estado", area: "Área", progress: "Progreso", provider: "Proveedor", tags: "Tags" },
      readings: { title: "Lectura", type: "Tipo", course: "Curso", status: "Estado", source: "Fuente", tags: "Tags", due: "Para" },
      study_notes: { title: "Nota", course: "Curso", reading: "Lectura", concepts: "Conceptos", tags: "Tags", updated: "Actualizado" },
      resources: { title: "Recurso", type: "Tipo", link: "Enlace", course: "Curso", tags: "Tags" },
      exams: { title: "Evaluación", course: "Curso", date: "Fecha", weight: "Ponderación", status: "Estado", tags: "Tags" },
      flashcards: { front: "Frente", back: "Reverso", deck: "Baraja", ease: "Facilidad", interval: "Intervalo", due: "Revisión" },
      sessions: { date: "Fecha", duration: "Duración(min)", course: "Curso", topic: "Tema", notes: "Notas" },
    },
  },
};
async function readMapping() {
  const stored = await readFromFile<typeof DEFAULT_MAPPING>();
  return stored ?? DEFAULT_MAPPING;
}

async function writeMapping(data: any) {
  await writeToFile(data);
}

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:GET:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const json = await readMapping();
  return NextResponse.json(json, { headers: { "Cache-Control": "no-cache" } });
}
export async function PUT(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:PUT:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = await req.json();
  await writeMapping(body);
  return NextResponse.json({ ok: true });
}
