import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MappingStore } from "@/lib/mappingStore";
import { deletePage, MappingValidationError, updatePageFromMapping } from "@/lib/notion";
import { apiKeyOk, rateLimitOk } from "../../_utils/rateLimit";

const FILE = path.join(process.cwd(), ".ub_mapping.json");

async function loadMapping(): Promise<MappingStore | null> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as MappingStore;
  } catch {
    return null;
  }
}

function ensureEntityConfig(mapping: any, entity: string) {
  const dbId = mapping?.db?.[entity];
  const props = mapping?.props?.[entity];
  if (!dbId || typeof dbId !== "string" || !props) return null;
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
  if (!config) return invalid("entity_not_configured", 400);

  return { config };
}

export async function PATCH(req: Request, { params }: { params: { entity: string; id: string } }) {
  const entity = params.entity;
  const pageId = params.id;
  const auth = await authenticate(req, entity, "PATCH");
  if (auth instanceof NextResponse) return auth;
  const { config } = auth as any;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return invalid("invalid_json", 400);
  }

  const payload = body?.data ?? body;
  if (!payload || typeof payload !== "object") return invalid("invalid_payload", 400);

  try {
    const updated = await updatePageFromMapping(pageId, config.dbId, config.props, payload);
    return NextResponse.json({ id: (updated as any)?.id ?? pageId });
  } catch (err: any) {
    if (err instanceof MappingValidationError) {
      return invalid(err.message, 400);
    }
    console.error(err);
    return invalid("notion_error", 502);
  }
}

export async function DELETE(req: Request, { params }: { params: { entity: string; id: string } }) {
  const entity = params.entity;
  const pageId = params.id;
  const auth = await authenticate(req, entity, "DELETE");
  if (auth instanceof NextResponse) return auth;

  try {
    await deletePage(pageId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return invalid("notion_error", 502);
  }
}
