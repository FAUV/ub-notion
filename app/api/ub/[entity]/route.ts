import { NextResponse } from "next/server";
import {
  queryDb,
  getTitle,
  getSelect,
  getMulti,
  getDateISO,
  getNumber,
  getRich,
  getRelationIds,
  resolveRelationTitles,
  notion,
} from "@/lib/notion";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";
import { readMapping } from "@/lib/mappingStore";
import { buildEntityProperties, type EntityName } from "@/lib/ub/entitySchemas";

function pick(p: any, key: string) { return p?.[key]; }

const ALLOWED_ENTITIES: EntityName[] = [
  "tasks",
  "projects",
  "areas",
  "notes",
  "goals",
  "habits",
  "reviews",
  "calendar",
];

function isEntity(entity: string): entity is EntityName {
  return ALLOWED_ENTITIES.includes(entity as EntityName);
}

function buildFilters(entity: EntityName, props: any, searchParams: URLSearchParams) {
  const and: any[] = [];
  const sorts: any[] = [];
  const q = searchParams.get("q");
  if (q && props.title) and.push({ property: props.title, title: { contains: q } });
  if (entity === "tasks") {
    const status = searchParams.get("status");
    if (status && props.status) and.push({ property: props.status, select: { equals: status } });
    const area = searchParams.get("area");
    if (area && props.area) and.push({ property: props.area, select: { equals: area } });
    const dueFrom = searchParams.get("due_from");
    const dueTo = searchParams.get("due_to");
    if (props.due && (dueFrom || dueTo)) {
      const date: any = {};
      if (dueFrom) date.on_or_after = dueFrom;
      if (dueTo) date.on_or_before = dueTo;
      and.push({ property: props.due, date });
    }
    if (props.due) sorts.push({ property: props.due, direction: "ascending" });
  }
  return { filter: and.length ? { and } : undefined, sorts };
}

function transform(entity: EntityName, page: any, propsMap: Record<string, string>) {
  const p = page.properties || {};
  const P = (k: string) => pick(p, propsMap[k]);
  switch (entity) {
    case "tasks":
      return {
        id: page.id,
        title: getTitle(P("title")),
        status: getSelect(P("status")) ?? "Por hacer",
        project_ids: getRelationIds(P("project")),
        area: getSelect(P("area")) ?? null,
        priority: getSelect(P("priority")) ?? "Media",
        due: getDateISO(P("due")),
        scheduled: getDateISO(P("scheduled")),
        energy: getSelect(P("energy")),
        effort: getSelect(P("effort")),
        tags: getMulti(P("tags")),
        created: getDateISO(P("created")),
        updated: page.last_edited_time,
      };
    case "projects":
      return {
        id: page.id,
        title: getTitle(P("title")),
        status: getSelect(P("status")) ?? "Activo",
        area: getSelect(P("area")),
        due: getDateISO(P("due")),
        progress: Number(getNumber(P("progress")) ?? 0),
        lead: getSelect(P("lead")),
        tags: getMulti(P("tags")),
      };
    case "areas":
      return {
        id: page.id,
        title: getTitle(P("title")),
        owner: getSelect(P("owner")),
        mission: getRich(P("mission")),
        tags: getMulti(P("tags")),
      };
    case "notes":
      return {
        id: page.id,
        title: getTitle(P("title")),
        type: getSelect(P("type")),
        area: getSelect(P("area")),
        project_ids: getRelationIds(P("project")),
        tags: getMulti(P("tags")),
        updated: page.last_edited_time,
      };
    case "goals":
      return {
        id: page.id,
        title: getTitle(P("title")),
        horizon: getSelect(P("horizon")),
        progress: Number(getNumber(P("progress")) ?? 0),
        area: getSelect(P("area")),
        tags: getMulti(P("tags")),
      };
    case "habits":
      return {
        id: page.id,
        title: getTitle(P("title")),
        streak: Number(getNumber(P("streak")) ?? 0),
        last: getDateISO(P("last")),
        cadence: getSelect(P("cadence")),
      };
    case "reviews":
      return {
        id: page.id,
        title: getTitle(P("title")),
        period: getRich(P("period")),
        mood: getSelect(P("mood")),
        highlights: getRich(P("highlights")),
        next: getRich(P("next")),
      };
    case "calendar":
      return {
        id: page.id,
        title: getTitle(P("title")),
        start: getDateISO(P("start")),
        end: getDateISO(P("end")),
        related_ids: getRelationIds(P("related")),
      };
    default:
      return null;
  }
}

async function ensureMapping() {
  const mapping = await readMapping();
  if (!mapping) throw new Error("mapping_not_found");
  return mapping;
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function rateLimited() {
  return NextResponse.json({ error: "rate_limited" }, { status: 429 });
}

export async function GET(req: Request, { params }: { params: { entity: string } }) {
  if (!apiKeyOk(req)) return unauthorized();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`entity:${params.entity}:GET:${ip}`)) return rateLimited();

  const entityParam = params.entity;
  if (!isEntity(entityParam)) {
    return NextResponse.json({ error: "unknown_entity" }, { status: 400 });
  }

  const mapping = await ensureMapping();
  const dbId = mapping.db?.[entityParam];
  const props = mapping.props?.[entityParam];
  if (!dbId || !props) {
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  }

  const url = new URL(req.url);
  const filters = buildFilters(entityParam, props, url.searchParams);
  const pages = await queryDb(dbId, filters);
  let rows: any[] = pages.map((pg) => transform(entityParam, pg, props)).filter(Boolean) as any[];

  if (url.searchParams.get("expand") === "relations") {
    if (entityParam === "tasks" && props.project) {
      const ids = rows.flatMap((r: any) => r.project_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({
        ...r,
        project: (r.project_ids || []).map((id: string) => map[id]).filter(Boolean).join(", "),
      }));
    }
    if (entityParam === "notes" && props.project) {
      const ids = rows.flatMap((r: any) => r.project_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({
        ...r,
        project: (r.project_ids || []).map((id: string) => map[id]).filter(Boolean).join(", "),
      }));
    }
    if (entityParam === "calendar" && props.related) {
      const ids = rows.flatMap((r: any) => r.related_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({
        ...r,
        related: (r.related_ids || []).map((id: string) => map[id]).filter(Boolean).join(", "),
      }));
    }
  }

  return NextResponse.json(rows, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
  });
}

export async function POST(req: Request, { params }: { params: { entity: string } }) {
  if (!apiKeyOk(req)) return unauthorized();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`entity:${params.entity}:POST:${ip}`)) return rateLimited();
  if (!isEntity(params.entity)) {
    return NextResponse.json({ error: "unknown_entity" }, { status: 400 });
  }
  const body = await req.json();
  const mapping = await ensureMapping();
  const dbId = mapping.db?.[params.entity];
  const props = mapping.props?.[params.entity];
  if (!dbId || !props) {
    return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  }
  try {
    const properties = await buildEntityProperties(params.entity, dbId, props, body, "create");
    const created = await notion.pages.create({ parent: { database_id: dbId }, properties });
    const item = transform(params.entity, created, props);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "create_failed" }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: { entity: string } }) {
  if (!apiKeyOk(req)) return unauthorized();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`entity:${params.entity}:PATCH:${ip}`)) return rateLimited();
  if (!isEntity(params.entity)) {
    return NextResponse.json({ error: "unknown_entity" }, { status: 400 });
  }
  const url = new URL(req.url);
  const body = await req.json();
  const id = body.id ?? url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const mapping = await ensureMapping();
  const dbId = mapping.db?.[params.entity];
  const props = mapping.props?.[params.entity];
  if (!dbId || !props) {
    return NextResponse.json({ error: "mapping_missing" }, { status: 400 });
  }
  try {
    const properties = await buildEntityProperties(params.entity, dbId, props, body, "update");
    const updated = await notion.pages.update({ page_id: id, properties });
    const item = transform(params.entity, updated, props);
    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "update_failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { entity: string } }) {
  if (!apiKeyOk(req)) return unauthorized();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`entity:${params.entity}:DELETE:${ip}`)) return rateLimited();
  if (!isEntity(params.entity)) {
    return NextResponse.json({ error: "unknown_entity" }, { status: 400 });
  }
  const url = new URL(req.url);
  const body = req.method === "DELETE" ? await req.json().catch(() => ({})) : {};
  const id = (body as any)?.id ?? url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  try {
    await notion.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "delete_failed" }, { status: 400 });
  }
}
