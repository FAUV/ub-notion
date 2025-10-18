import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_MAPPING, type MappingStore } from "@/lib/mappingStore";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

const FILE = path.join(process.cwd(), ".ub_mapping.json");

async function readMapping(): Promise<MappingStore> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as MappingStore;
  } catch {
    return DEFAULT_MAPPING;
  }
}

async function writeMapping(data: MappingStore) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
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
  const body = (await req.json()) as MappingStore;
  await writeMapping(body);
  return NextResponse.json({ ok: true });
}
