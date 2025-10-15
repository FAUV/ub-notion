import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { apiKeyOk, rateLimitOk } from "../_utils/rateLimit";

export async function GET(req: Request) {
  if (!apiKeyOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  if (!rateLimitOk(`discover:${ip}`)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const res = await notion.search({
    query: q || undefined,
    filter: { property: "object", value: "database" },
    sort: { direction: "descending", timestamp: "last_edited_time" },
  });
  const items = (res.results || []).map((db: any) => ({
    id: db.id,
    title: (db.title?.[0]?.plain_text ?? "").trim(),
    last_edited_time: db.last_edited_time,
    url: db.url,
  }));
  return NextResponse.json({ databases: items });
}
