import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const CL_TZ = process.env.NOTION_TIMEZONE || "America/Santiago";

export type NotionProp = any;

export function getTitle(p: NotionProp): string { return p?.title?.[0]?.plain_text ?? ""; }
export function getSelect(p: NotionProp): string | null { return p?.select?.name ?? null; }
export function getMulti(p: NotionProp): string[] { return (p?.multi_select ?? []).map((o: any) => o.name); }
export function getDateISO(p: NotionProp): string | null { return p?.date?.start ?? null; }
export function getNumber(p: NotionProp): number | null { return p?.number ?? null; }
export function getRich(p: NotionProp): string { return p?.rich_text?.[0]?.plain_text ?? ""; }
export function getUrl(p: NotionProp): string | null { return p?.url ?? null; }
export function getRelationIds(p: NotionProp): string[] { return (p?.relation ?? []).map((r: any) => r.id); }

export async function queryDb(database_id: string, body: any = {}) {
  const res = await notion.databases.query({ database_id, ...body });
  return res.results as any[];
}
export async function retrievePage(pageId: string) { return await notion.pages.retrieve({ page_id: pageId }); }
export function findTitleProperty(properties: Record<string, any>): string | null {
  for (const [k, v] of Object.entries(properties || {})) if ((v as any)?.type === "title") return k; return null;
}
export function toCL(iso?: string | null): string | null { if (!iso) return null; return new Date(iso).toLocaleString("es-CL", { timeZone: CL_TZ }); }

const titleCache = new Map<string, string>();
export async function resolveRelationTitles(ids: string[]): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  const out: Record<string, string> = {}; const missing: string[] = [];
  for (const id of uniq) { if (titleCache.has(id)) out[id] = titleCache.get(id)!; else missing.push(id); }
  const chunks: string[][] = []; while (missing.length) chunks.push(missing.splice(0, 10));
  for (const group of chunks) {
    const res = await Promise.allSettled(group.map((id) => retrievePage(id)));
    res.forEach((r, idx) => {
      const id = group[idx];
      if (r.status === "fulfilled") {
        const props: any = (r.value as any)?.properties || {};
        const titleKey = findTitleProperty(props);
        const title = titleKey ? getTitle(props[titleKey]) : "";
        titleCache.set(id, title); out[id] = title;
      } else { out[id] = ""; }
    });
  }
  return out;
}
