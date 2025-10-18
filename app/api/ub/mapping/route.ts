import { NextResponse } from "next/server";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";
import { DEFAULT_MAPPING } from "@/lib/mapping";
import { readMapping, writeMapping } from "@/lib/mappingStore";

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:GET:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const json = await readMapping();
  return NextResponse.json(json ?? DEFAULT_MAPPING, { headers: { "Cache-Control": "no-cache" } });
}

export async function PUT(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:PUT:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = await req.json();
  const next = { ...DEFAULT_MAPPING, ...body };
  await writeMapping(next);
  return NextResponse.json({ ok: true });
}
