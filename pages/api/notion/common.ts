import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2025-09-03" });
export function assertEnv(){ if(!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido"); }
export function getDbId(envKey:string){ const v=process.env[envKey]; if(!v) throw new Error(`Falta ${envKey}`); return v; }
export type Handler = (req:NextApiRequest,res:NextApiResponse)=>Promise<void>;

export function normalizeUuid(input:string){
  const raw=(input||"").trim();
  if(!raw) return raw;
  const hyph=/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if(hyph.test(raw)) return raw.toLowerCase();
  const m32=raw.match(/[0-9a-fA-F]{32}/);
  if(m32){ const hex=m32[0].toLowerCase(); return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`; }
  return raw;
}
export const normalizePageId = normalizeUuid;

export function toDsId(input:string){
  const raw=(input||"").trim();
  if(!raw) return raw;
  const mUrl = raw.match(/[0-9a-fA-F]{32}/);
  if(mUrl) return mUrl[0].toLowerCase();
  const normalized = normalizeUuid(raw);
  if(!normalized) return normalized;
  const hex = normalized.replace(/-/g,"").toLowerCase();
  return /^[0-9a-f]{32}$/.test(hex) ? hex : raw.toLowerCase();
}

// --- Esquema por DATA SOURCE
const dsSchemaCache = new Map<string, any>();
export async function getDbSchema(DS:string){
  const id = toDsId(DS);
  if(dsSchemaCache.has(id)) return dsSchemaCache.get(id);
  const s = await notion.request({ method:"get", path:`data_sources/${id}` }) as any;
  dsSchemaCache.set(id, s);
  return s;
}
export async function titleKey(DS:string): Promise<string>{
  const schema = await getDbSchema(DS);
  for (const [k, v] of Object.entries<any>(schema?.properties ?? {})){
    if (v?.type === "title") return k;
  }
  return "Name";
}
export async function resolvePropName(DS:string, candidates:string[]): Promise<string|null> {
  const schema = await getDbSchema(DS);
  const keys = Object.keys(schema?.properties ?? {});
  for(const k of candidates){ if(keys.includes(k)) return k; }
  return null;
}
export async function findDbIdByNames(candidates: string[]): Promise<string|null>{
  for(const q of candidates){
    const res = await notion.request({
      method: "post", path: "search",
      // @ts-ignore API 2025-09-03
      body: { query:q, filter:{ value:"data_source", property:"object" }, sort:{ direction:"descending", timestamp:"last_edited_time" }, page_size: 20 }
    }) as any;
    const hit = (res.results||[])[0];
    if(hit?.id) return toDsId(hit.id);
  }
  return null;
}
export async function queryDataSource(DS:string, body:any={}){
  const id = toDsId(DS);
  const res = await notion.request({ method:"post", path:`data_sources/${id}/query`, body: { page_size: 100, ...body } }) as any;
  return res;
}
export async function buildProps(DS:string, input:any){
  const props:any = {};
  if (input.name){ const tKey = await titleKey(DS); props[tKey] = { title: [{ text: { content: String(input.name) } }] }; }
  if (input.status){ const key = await resolvePropName(DS, ["Status","Estado"]); if (key) props[key] = { status: { name: String(input.status) } }; }
  if (input.start){ const key = await resolvePropName(DS, ["Start","Inicio"]); if (key) props[key] = { date: { start: String(input.start) } }; }
  if (input.end){ const key = await resolvePropName(DS, ["End","Fin"]); if (key) props[key] = { date: { start: String(input.end) } }; }
  if (typeof input.order === "number"){ const key = await resolvePropName(DS, ["Order","Orden"]); if (key) props[key] = { number: input.order }; }
  if (typeof input.durationMin === "number"){ const key = await resolvePropName(DS, ["Duration (min)","Duración (min)"]); if (key) props[key] = { number: input.durationMin }; }
  if (typeof input.notes === "string"){ const key = await resolvePropName(DS, ["Notes","Notas"]); if (key) props[key] = { rich_text: [{ text: { content: input.notes } }] }; }
  if (Array.isArray(input.relations)){
    for (const r of input.relations){
      if (!r?.ids?.length) continue; const key = await resolvePropName(DS, r.keyCandidates||[]);
      if (key) props[key] = { relation: r.ids.map((id:string)=>({ id: normalizeUuid(id) })) };
    }
  }
  if (input.url){ const key = await resolvePropName(DS, ["URL","Enlace"]); if (key) props[key] = { url: String(input.url) }; }
  return props;
}
