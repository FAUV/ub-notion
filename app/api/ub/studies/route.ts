import { NextResponse } from "next/server";
import {
  queryDb,
  getTitle,
  getSelect,
  getMulti,
  getDateISO,
  getNumber,
  getRich,
  getUrl,
  notion,
} from "@/lib/notion";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";
import { readMapping } from "@/lib/mappingStore";
import { buildStudyProperties, type StudyCollections } from "@/lib/ub/entitySchemas";

const OFFLINE = process.env.UB_OFFLINE === "true";

const COLLECTIONS: StudyCollections[] = [
  "courses",
  "readings",
  "study_notes",
  "resources",
  "exams",
  "flashcards",
  "sessions",
];

function isCollection(value: string): value is StudyCollections {
  return COLLECTIONS.includes(value as StudyCollections);
}

const STUDY_TRANSFORMS: Record<StudyCollections, (page: any, props: any) => any> = {
  courses: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      title: getTitle(p[mp.title]),
      status: getSelect(p[mp.status]) ?? "Activo",
      area: getSelect(p[mp.area]),
      progress: Number(getNumber(p[mp.progress]) ?? 0),
      provider: getSelect(p[mp.provider]),
      tags: getMulti(p[mp.tags]),
    };
  },
  readings: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      title: getTitle(p[mp.title]),
      type: getSelect(p[mp.type]),
      course: getSelect(p[mp.course]),
      status: getSelect(p[mp.status]),
      source: getSelect(p[mp.source]),
      tags: getMulti(p[mp.tags]),
      due: getDateISO(p[mp.due]),
    };
  },
  study_notes: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      title: getTitle(p[mp.title]),
      course: getSelect(p[mp.course]),
      reading: getSelect(p[mp.reading]),
      concepts: getMulti(p[mp.concepts]),
      tags: getMulti(p[mp.tags]),
      updated: pg.last_edited_time,
    };
  },
  resources: (pg, mp) => {
    const p = pg.properties;
    const raw = p[mp.link];
    const link = getUrl(raw) || getRich(raw);
    return {
      id: pg.id,
      title: getTitle(p[mp.title]),
      type: getSelect(p[mp.type]),
      link,
      course: getSelect(p[mp.course]),
      tags: getMulti(p[mp.tags]),
    };
  },
  exams: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      title: getTitle(p[mp.title]),
      course: getSelect(p[mp.course]),
      date: getDateISO(p[mp.date]),
      weight: Number(getNumber(p[mp.weight]) ?? 0),
      status: getSelect(p[mp.status]),
      tags: getMulti(p[mp.tags]),
    };
  },
  flashcards: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      front: getRich(p[mp.front]) || getTitle(p[mp.front]),
      back: getRich(p[mp.back]) || getTitle(p[mp.back]),
      deck: getSelect(p[mp.deck]),
      ease: Number(getNumber(p[mp.ease]) ?? 2.5),
      interval: Number(getNumber(p[mp.interval]) ?? 0),
      due: getDateISO(p[mp.due]),
    };
  },
  sessions: (pg, mp) => {
    const p = pg.properties;
    return {
      id: pg.id,
      date: getDateISO(p[mp.date]),
      duration: Number(getNumber(p[mp.duration]) ?? 0),
      course: getSelect(p[mp.course]),
      topic: getRich(p[mp.topic]),
      notes: getRich(p[mp.notes]),
    };
  },
};

async function ensureStudiesMapping() {
  const mapping = await readMapping();
  return mapping?.db?.studies && mapping?.props?.studies ? mapping : null;
}

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:GET:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  if (OFFLINE) {
    return NextResponse.json(
      {
        courses: [],
        readings: [],
        study_notes: [],
        resources: [],
        exams: [],
        flashcards: [],
        sessions: [],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const mapping = await ensureStudiesMapping();
  if (!mapping) {
    return NextResponse.json({
      courses: [],
      readings: [],
      study_notes: [],
      resources: [],
      exams: [],
      flashcards: [],
      sessions: [],
    });
  }

  const d = mapping.db.studies;
  const m = mapping.props.studies;
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
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

  const out = {
    courses: courses.map((pg: any) => STUDY_TRANSFORMS.courses(pg, m.courses)),
    readings: readings.map((pg: any) => STUDY_TRANSFORMS.readings(pg, m.readings)),
    study_notes: notes.map((pg: any) => STUDY_TRANSFORMS.study_notes(pg, m.study_notes)),
    resources: resources.map((pg: any) => STUDY_TRANSFORMS.resources(pg, m.resources)),
    exams: exams.map((pg: any) => STUDY_TRANSFORMS.exams(pg, m.exams)),
    flashcards: flashcards.map((pg: any) => STUDY_TRANSFORMS.flashcards(pg, m.flashcards)),
    sessions: sessions.map((pg: any) => STUDY_TRANSFORMS.sessions(pg, m.sessions)),
  };
  return NextResponse.json(out, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" } });
}

export async function POST(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:POST:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (OFFLINE) {
    return NextResponse.json({ error: "offline_mode" }, { status: 503 });
  }
  const body = await req.json();
  const url = new URL(req.url);
  const collection = (body.collection ?? url.searchParams.get("collection")) as string;
  if (!collection || !isCollection(collection)) {
    return NextResponse.json({ error: "invalid_collection" }, { status: 400 });
  }
  const mapping = await ensureStudiesMapping();
  if (!mapping) return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  const dbId = mapping.db.studies?.[collection];
  const props = mapping.props.studies?.[collection];
  if (!dbId || !props) return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  try {
    const properties = await buildStudyProperties(collection, dbId, props, body, "create");
    const created = await notion.pages.create({ parent: { database_id: dbId }, properties });
    const item = STUDY_TRANSFORMS[collection](created, props);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "create_failed" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:PATCH:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (OFFLINE) {
    return NextResponse.json({ error: "offline_mode" }, { status: 503 });
  }
  const url = new URL(req.url);
  const body = await req.json();
  const collection = (body.collection ?? url.searchParams.get("collection")) as string;
  const id = body.id ?? url.searchParams.get("id");
  if (!collection || !isCollection(collection)) return NextResponse.json({ error: "invalid_collection" }, { status: 400 });
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const mapping = await ensureStudiesMapping();
  if (!mapping) return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  const dbId = mapping.db.studies?.[collection];
  const props = mapping.props.studies?.[collection];
  if (!dbId || !props) return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  try {
    const properties = await buildStudyProperties(collection, dbId, props, body, "update");
    const updated = await notion.pages.update({ page_id: id, properties });
    const item = STUDY_TRANSFORMS[collection](updated, props);
    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "update_failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`studies:DELETE:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (OFFLINE) {
    return NextResponse.json({ error: "offline_mode" }, { status: 503 });
  }
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const collection = (body.collection ?? url.searchParams.get("collection")) as string;
  const id = (body as any).id ?? url.searchParams.get("id");
  if (!collection || !isCollection(collection)) return NextResponse.json({ error: "invalid_collection" }, { status: 400 });
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  try {
    await notion.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "delete_failed" }, { status: 400 });
  }
}
