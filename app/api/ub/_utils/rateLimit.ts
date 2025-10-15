type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_LIMIT = Number(process.env.UB_RATE_LIMIT || 120);

export function rateLimitOk(key: string, limit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const b = buckets.get(key) || { tokens: limit, updatedAt: now };
  const elapsed = now - b.updatedAt;
  const refill = Math.floor(elapsed / WINDOW_MS) * limit;
  b.tokens = Math.min(limit, b.tokens + Math.max(0, refill));
  b.updatedAt = now;
  if (b.tokens <= 0) { buckets.set(key, b); return false; }
  b.tokens -= 1; buckets.set(key, b); return true;
}

export function apiKeyOk(req: Request): boolean {
  const expected = process.env.UB_API_KEY;
  if (!expected) return true;
  const got = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key") || "";
  return got === expected;
}
