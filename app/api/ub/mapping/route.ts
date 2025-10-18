import { NextResponse } from "next/server";
import { DEFAULT_MAPPING, loadMapping, saveMapping } from "@/lib/mappingStore";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:GET:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const json = (await loadMapping({ fallbackToDefault: true })) ?? DEFAULT_MAPPING;
  return NextResponse.json(json, { headers: { "Cache-Control": "no-cache" } });
}

export async function PUT(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`mapping:PUT:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json();
  const persisted = await saveMapping(body);
  if (!persisted) return NextResponse.json({ error: "persist_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
