import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
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
  createPageFromMapping,
  MappingValidationError,
} from "@/lib/notion";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

const FILE2 = path.join(process.cwd(), ".ub_mapping.json");
async function loadMapping() { try { return JSON.parse(await fs.readFile(FILE2, "utf-8")); } catch { return null; } }
function pick(p: any, key: string) { return p?.[key]; }

function ensureEntityConfig(mapping: any, entity: string) {
  const dbId = mapping?.db?.[entity];
  const props = mapping?.props?.[entity];
  if (!dbId || typeof dbId !== "string" || !props) {
    return null;
  }
  return { dbId, props };
}

function ipFrom(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
}

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function authenticate(req: Request, entity: string, action: string) {
  if (!apiKeyOk(req)) return invalid("unauthorized", 401);
  const ip = ipFrom(req);
  if (!rateLimitOk(`entity:${entity}:${action}:${ip}`)) return invalid("rate_limited", 429);

  const mapping = await loadMapping();
  if (!mapping) return invalid("mapping not found", 500);

  const config = ensureEntityConfig(mapping, entity);
  if (!config) return { mapping, config: null };

  return { mapping, config };
}

function buildFilters(entity: string, props: any, searchParams: URLSearchParams) {
  const and: any[] = []; const sorts: any[] = [];
  const q = searchParams.get("q"); if (q && props.title) and.push({ property: props.title, title: { contains: q } });
  if (entity === "tasks") {
    const status = searchParams.get("status"); if (status && props.status) and.push({ property: props.status, select: { equals: status } });
    const area = searchParams.get("area"); if (area && props.area) and.push({ property: props.area, select: { equals: area } });
    const dueFrom = searchParams.get("due_from"); const dueTo = searchParams.get("due_to");
    if (props.due && (dueFrom || dueTo)) { const date: any = {}; if (dueFrom) date.on_or_after = dueFrom; if (dueTo) date.on_or_before = dueTo; and.push({ property: props.due, date }); }
    if (props.due) sorts.push({ property: props.due, direction: "ascending" });
  }
  return { filter: and.length ? { and } : undefined, sorts };
}

function transform(entity: string, page: any, propsMap: Record<string, string>) {
  const p = page.properties || {}; const P = (k: string) => pick(p, propsMap[k]);
  switch (entity) {
    case "tasks": return { id: page.id, title: getTitle(P("title")), status: getSelect(P("status")) ?? "Por hacer", project_ids: getRelationIds(P("project")), area: getSelect(P("area")) ?? null, priority: getSelect(P("priority")) ?? "Media", due: getDateISO(P("due")), scheduled: getDateISO(P("scheduled")), energy: getSelect(P("energy")), effort: getSelect(P("effort")), tags: getMulti(P("tags")), created: getDateISO(P("created")), updated: page.last_edited_time };
    case "projects": return { id: page.id, title: getTitle(P("title")), status: getSelect(P("status")) ?? "Activo", area: getSelect(P("area")), due: getDateISO(P("due")), progress: Number(getNumber(P("progress")) ?? 0), lead: getSelect(P("lead")), tags: getMulti(P("tags")) };
    case "areas": return { id: page.id, title: getTitle(P("title")), owner: getSelect(P("owner")), mission: getRich(P("mission")), tags: getMulti(P("tags")) };
    case "notes": return { id: page.id, title: getTitle(P("title")), type: getSelect(P("type")), area: getSelect(P("area")), project_ids: getRelationIds(P("project")), tags: getMulti(P("tags")), updated: page.last_edited_time };
    case "goals": return { id: page.id, title: getTitle(P("title")), horizon: getSelect(P("horizon")), progress: Number(getNumber(P("progress")) ?? 0), area: getSelect(P("area")), tags: getMulti(P("tags")) };
    case "habits": return { id: page.id, title: getTitle(P("title")), streak: Number(getNumber(P("streak")) ?? 0), last: getDateISO(P("last")), cadence: getSelect(P("cadence")) };
    case "reviews": return { id: page.id, title: getTitle(P("title")), period: getRich(P("period")), mood: getSelect(P("mood")), highlights: getRich(P("highlights")), next: getRich(P("next")) };
    case "calendar": return { id: page.id, title: getTitle(P("title")), start: getDateISO(P("start")), end: getDateISO(P("end")), related_ids: getRelationIds(P("related")) };
    default: return null;
  }
}

export async function GET(req: Request, { params }: { params: { entity: string } }) {
  const entity = params.entity;
  const authResult = await authenticate(req, entity, "GET");
  if (authResult instanceof NextResponse) return authResult;
  const { config } = authResult as any;
  const url = new URL(req.url); const sp = url.searchParams;

  if (!config) {
    return NextResponse.json([], { status: 200, headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } });
  }

  const { dbId, props } = config;

  const q = buildFilters(entity, props, sp);
  const pages = await queryDb(dbId, q);
  let rows: any[] = pages.map((pg) => transform(entity, pg, props)).filter(Boolean) as any[];

  if (sp.get("expand") == "relations") {
    if (entity === "tasks" && props.project) {
      const ids = rows.flatMap((r: any) => r.project_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({ ...r, project: (r.project_ids || []).map((id: string) => map[id]).filter(Boolean).join(", ") }));
    }
    if (entity === "notes" && props.project) {
      const ids = rows.flatMap((r: any) => r.project_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({ ...r, project: (r.project_ids || []).map((id: string) => map[id]).filter(Boolean).join(", ") }));
    }
    if (entity === "calendar" && props.related) {
      const ids = rows.flatMap((r: any) => r.related_ids || []);
      const map = await resolveRelationTitles(ids);
      rows = rows.map((r: any) => ({ ...r, related: (r.related_ids || []).map((id: string) => map[id]).filter(Boolean).join(", ") }));
    }
  }

  return NextResponse.json(rows, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" } });
}

export async function POST(req: Request, { params }: { params: { entity: string } }) {
  const entity = params.entity;
  const auth = await authenticate(req, entity, "POST");
  if (auth instanceof NextResponse) return auth;
  const { config } = auth as any;

  if (!config) return invalid("entity_not_configured", 400);

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return invalid("invalid_json", 400);
  }

  const payload = body?.data ?? body;
  if (!payload || typeof payload !== "object") return invalid("invalid_payload", 400);

  try {
    const created = await createPageFromMapping(config.dbId, config.props, payload);
    return NextResponse.json({ id: (created as any)?.id ?? null }, { status: 201 });
  } catch (err: any) {
    if (err instanceof MappingValidationError) {
      return invalid(err.message, 400);
    }
    console.error(err);
    return invalid("notion_error", 502);
  }
}

export async function PATCH(req: Request, ctx: { params: { entity: string } }) {
  return invalid("use /api/ub/[entity]/[id]", 405);
}

export async function DELETE(req: Request, ctx: { params: { entity: string } }) {
  return invalid("use /api/ub/[entity]/[id]", 405);
}
