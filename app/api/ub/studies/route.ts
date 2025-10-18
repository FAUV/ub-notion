import { NextResponse } from "next/server";
import { queryDb, getTitle, getSelect, getMulti, getDateISO, getNumber, getRich, getUrl } from "@/lib/notion";
import { readFromFile } from "@/lib/mappingStore";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

async function loadMapping() {
  return readFromFile<any>();
}
function pick(p: any, key: string) { return p?.[key]; }

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const mapping = await loadMapping();
  if (!mapping?.db?.studies) {
    return NextResponse.json({ courses: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [] });
  }
  const d = mapping.db.studies; const m = mapping.props.studies;
  const url = new URL(req.url); const q = url.searchParams.get("q");
  const filtersFor = (props: any) => (q && props?.title ? { filter: { property: props.title, title: { contains: q } } } : {});

  const [courses, readings, notes, resources, exams, flashcards, sessions] = await Promise.all([
    d.courses ? queryDb(d.courses, filtersFor(m.courses)) : [],
    d.readings ? queryDb(d.readings, filtersFor(m.readings)) : [],
    d.study_notes ? queryDb(d.study_notes, filtersFor(m.study_notes)) : [],
    d.resources ? queryDb(d.resources, filtersFor(m.resources)) : [],
    d.exams ? queryDb(d.exams, filtersFor(m.exams)) : [],
    d.flashcards ? queryDb(d.flashcards, filtersFor(m.flashcards)) : [],
    d.sessions ? queryDb(d.sessions, { sorts: [{ timestamp: "created_time", direction: "descending" }] }) : [],
  ]);

  const tCourses = (pg: any) => { const p = pg.properties, mp = m.courses;
    return { id: pg.id, title: getTitle(p[mp.title]), status: getSelect(p[mp.status]) ?? "Activo", area: getSelect(p[mp.area]), progress: Number(getNumber(p[mp.progress]) ?? 0), provider: getSelect(p[mp.provider]), tags: getMulti(p[mp.tags]) };
  };
  const tReadings = (pg: any) => { const p = pg.properties, mp = m.readings;
    return { id: pg.id, title: getTitle(p[mp.title]), type: getSelect(p[mp.type]), course: getSelect(p[mp.course]), status: getSelect(p[mp.status]), source: getSelect(p[mp.source]), tags: getMulti(p[mp.tags]), due: getDateISO(p[mp.due]) };
  };
  const tNotes = (pg: any) => { const p = pg.properties, mp = m.study_notes;
    return { id: pg.id, title: getTitle(p[mp.title]), course: getSelect(p[mp.course]), reading: getSelect(p[mp.reading]), concepts: getMulti(p[mp.concepts]), tags: getMulti(p[mp.tags]), updated: pg.last_edited_time };
  };
  const tResources = (pg: any) => { const p = pg.properties, mp = m.resources; const raw = p[mp.link]; const url = getUrl(raw) || getRich(raw);
    return { id: pg.id, title: getTitle(p[mp.title]), type: getSelect(p[mp.type]), link: url, course: getSelect(p[mp.course]), tags: getMulti(p[mp.tags]) };
  };
  const tExams = (pg: any) => { const p = pg.properties, mp = m.exams;
    return { id: pg.id, title: getTitle(p[mp.title]), course: getSelect(p[mp.course]), date: getDateISO(p[mp.date]), weight: Number(getNumber(p[mp.weight]) ?? 0), status: getSelect(p[mp.status]), tags: getMulti(p[mp.tags]) };
  };
  const tFlash = (pg: any) => { const p = pg.properties, mp = m.flashcards;
    return { id: pg.id, front: getRich(p[mp.front]) || getTitle(p[mp.front]), back: getRich(p[mp.back]), deck: getSelect(p[mp.deck]), ease: Number(getNumber(p[mp.ease]) ?? 2.5), interval: Number(getNumber(p[mp.interval]) ?? 0), due: getDateISO(p[mp.due]) };
  };
  const tSessions = (pg: any) => { const p = pg.properties, mp = m.sessions;
    return { id: pg.id, date: getDateISO(p[mp.date]), duration: Number(getNumber(p[mp.duration]) ?? 0), course: getSelect(p[mp.course]), topic: getRich(p[mp.topic]), notes: getRich(p[mp.notes]) };
  };

  const out = {
    courses: courses.map(tCourses), readings: readings.map(tReadings), study_notes: notes.map(tNotes),
    resources: resources.map(tResources), exams: exams.map(tExams), flashcards: flashcards.map(tFlash), sessions: sessions.map(tSessions),
  };
  return NextResponse.json(out, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" } });
}
