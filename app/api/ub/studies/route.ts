import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { queryDb, getTitle, getSelect, getMulti, getDateISO, getNumber, getRich, getUrl, getRelationIds, resolveRelationTitles } from "@/lib/notion";
import { DEFAULT_MAPPING, type MappingStore, type StudiesPropsMapping } from "@/lib/mappingStore";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

const FILE3 = path.join(process.cwd(), ".ub_mapping.json");
async function loadMapping(): Promise<MappingStore | null> {
  try {
    return JSON.parse(await fs.readFile(FILE3, "utf-8")) as MappingStore;
  } catch {
    return null;
  }
}
function pick(p: any, key: string) { return p?.[key]; }

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const mapping = await loadMapping();
  if (!mapping || !mapping.db?.studies) {
    return NextResponse.json({ courses: [], modules: [], lessons: [], readings: [], study_notes: [], resources: [], exams: [], flashcards: [], sessions: [] });
  }
  const d = mapping.db.studies;
  const m: StudiesPropsMapping = mapping.props?.studies ?? DEFAULT_MAPPING.props.studies ?? {};
  const url = new URL(req.url); const q = url.searchParams.get("q");
  const filtersFor = (props: any) => (q && props?.title ? { filter: { property: props.title, title: { contains: q } } } : {});

  const [courses, readings, notes, resources, exams, flashcards, sessions, modules, lessons] = await Promise.all([
    d.courses ? queryDb(d.courses, filtersFor(m.courses)) : [],
    d.readings ? queryDb(d.readings, filtersFor(m.readings)) : [],
    d.study_notes ? queryDb(d.study_notes, filtersFor(m.study_notes)) : [],
    d.resources ? queryDb(d.resources, filtersFor(m.resources)) : [],
    d.exams ? queryDb(d.exams, filtersFor(m.exams)) : [],
    d.flashcards ? queryDb(d.flashcards, filtersFor(m.flashcards)) : [],
    d.sessions ? queryDb(d.sessions, { sorts: [{ timestamp: "created_time", direction: "descending" }] }) : [],
    d.modules ? queryDb(d.modules, filtersFor(m.modules)) : [],
    d.lessons ? queryDb(d.lessons, filtersFor(m.lessons)) : [],
  ]);

  const tCourses = (pg: any) => {
    const p = pg.properties; const mp = m.courses ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    const idClassKey = mp?.id_class;
    const idClassProp = idClassKey ? prop(idClassKey) : undefined;
    const idClass = idClassProp ? (getSelect(idClassProp) ?? getRich(idClassProp) ?? null) : null;
    return {
      id: pg.id,
      title: getTitle(prop(mp.title)),
      status: getSelect(prop(mp.status)) ?? "Activo",
      area: getSelect(prop(mp.area)),
      progress: Number(getNumber(prop(mp.progress)) ?? 0),
      provider: getSelect(prop(mp.provider)),
      id_class: idClass,
      tags: getMulti(prop(mp.tags)),
    };
  };
  const tReadings = (pg: any) => {
    const p = pg.properties; const mp = m.readings ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    return {
      id: pg.id,
      title: getTitle(prop(mp.title)),
      type: getSelect(prop(mp.type)),
      course: getSelect(prop(mp.course)),
      status: getSelect(prop(mp.status)),
      source: getSelect(prop(mp.source)),
      tags: getMulti(prop(mp.tags)),
      due: getDateISO(prop(mp.due)),
    };
  };
  const tNotes = (pg: any) => {
    const p = pg.properties; const mp = m.study_notes ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    return {
      id: pg.id,
      title: getTitle(prop(mp.title)),
      course: getSelect(prop(mp.course)),
      reading: getSelect(prop(mp.reading)),
      concepts: getMulti(prop(mp.concepts)),
      tags: getMulti(prop(mp.tags)),
      updated: pg.last_edited_time,
    };
  };
  const tResources = (pg: any) => {
    const p = pg.properties; const mp = m.resources ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    const raw = prop(mp.link);
    const url = getUrl(raw) || getRich(raw);
    return {
      id: pg.id,
      title: getTitle(prop(mp.title)),
      type: getSelect(prop(mp.type)),
      link: url,
      course: getSelect(prop(mp.course)),
      tags: getMulti(prop(mp.tags)),
    };
  };
  const tExams = (pg: any) => {
    const p = pg.properties; const mp = m.exams ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    return {
      id: pg.id,
      title: getTitle(prop(mp.title)),
      course: getSelect(prop(mp.course)),
      date: getDateISO(prop(mp.date)),
      weight: Number(getNumber(prop(mp.weight)) ?? 0),
      status: getSelect(prop(mp.status)),
      tags: getMulti(prop(mp.tags)),
    };
  };
  const tFlash = (pg: any) => {
    const p = pg.properties; const mp = m.flashcards ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    const front = prop(mp.front);
    const back = prop(mp.back);
    return {
      id: pg.id,
      front: getRich(front) || getTitle(front),
      back: getRich(back),
      deck: getSelect(prop(mp.deck)),
      ease: Number(getNumber(prop(mp.ease)) ?? 2.5),
      interval: Number(getNumber(prop(mp.interval)) ?? 0),
      due: getDateISO(prop(mp.due)),
    };
  };
  const tSessions = (pg: any) => {
    const p = pg.properties; const mp = m.sessions ?? {};
    const prop = (key?: string) => (key ? p[key] : undefined);
    return {
      id: pg.id,
      date: getDateISO(prop(mp.date)),
      duration: Number(getNumber(prop(mp.duration)) ?? 0),
      course: getSelect(prop(mp.course)),
      topic: getRich(prop(mp.topic)),
      notes: getRich(prop(mp.notes)),
    };
  };
  const tModules = (pg: any) => {
    const p = pg.properties; const mp = m.modules ?? {};
    const courseIds = mp.course ? getRelationIds(p[mp.course]) : [];
    const lessonIds = mp.lessons ? getRelationIds(p[mp.lessons]) : [];
    const out: any = { id: pg.id };
    if (mp.title) out.title = getTitle(p[mp.title]);
    if (mp.status) out.status = getSelect(p[mp.status]) ?? null;
    if (mp.order) {
      const val = getNumber(p[mp.order]);
      out.order = val !== null && val !== undefined ? Number(val) : null;
    }
    if (mp.course) out.course_ids = courseIds;
    if (mp.lessons) out.lesson_ids = lessonIds;
    return out;
  };
  const tLessons = (pg: any) => {
    const p = pg.properties; const mp = m.lessons ?? {};
    const moduleIds = mp.module ? getRelationIds(p[mp.module]) : [];
    const courseIds = mp.course ? getRelationIds(p[mp.course]) : [];
    const out: any = { id: pg.id };
    if (mp.title) out.title = getTitle(p[mp.title]);
    if (mp.status) out.status = getSelect(p[mp.status]) ?? null;
    if (mp.order) {
      const val = getNumber(p[mp.order]);
      out.order = val !== null && val !== undefined ? Number(val) : null;
    }
    if (mp.module) out.module_ids = moduleIds;
    if (mp.course) out.course_ids = courseIds;
    return out;
  };

  const modulesMapped = modules.map(tModules);
  const lessonsMapped = lessons.map(tLessons);

  const relationIds = [
    ...modulesMapped.flatMap((mod: any) => [...(mod.course_ids ?? []), ...(mod.lesson_ids ?? [])]),
    ...lessonsMapped.flatMap((lesson: any) => [...(lesson.module_ids ?? []), ...(lesson.course_ids ?? [])]),
  ].filter(Boolean);
  const relationTitles = relationIds.length ? await resolveRelationTitles(relationIds) : {};

  const modulesOut = modulesMapped.map((mod: any) => ({
    ...mod,
    course: (mod.course_ids || []).map((id: string) => relationTitles[id]).filter(Boolean).join(", "),
    ...(mod.lesson_ids ? { lessons: (mod.lesson_ids || []).map((id: string) => relationTitles[id]).filter(Boolean) } : {}),
  }));
  const lessonsOut = lessonsMapped.map((lesson: any) => ({
    ...lesson,
    module: (lesson.module_ids || []).map((id: string) => relationTitles[id]).filter(Boolean).join(", "),
    course: (lesson.course_ids || []).map((id: string) => relationTitles[id]).filter(Boolean).join(", "),
  }));

  const out = {
    courses: courses.map(tCourses), readings: readings.map(tReadings), study_notes: notes.map(tNotes),
    resources: resources.map(tResources), exams: exams.map(tExams), flashcards: flashcards.map(tFlash), sessions: sessions.map(tSessions),
    modules: modulesOut, lessons: lessonsOut,
  };
  return NextResponse.json(out, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" } });
}
