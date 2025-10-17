import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";
export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2025-09-03" });
export function assertEnv(){ if(!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido"); }
export function getDbId(envKey:string){ const v=process.env[envKey]; if(!v) throw new Error(`Falta ${envKey}`); return v; }
export type Handler = (req:NextApiRequest,res:NextApiResponse)=>Promise<void>;
export async function findDbIdByNames(candidates: string[]): Promise<string|null>{
  const seen = new Set<string>();
  for(const q of candidates){
    const res = await notion.search({ query:q, filter:{ value:"database", property:"object" }, sort:{ direction:"descending", timestamp:"last_edited_time" }, page_size:20 });
    for(const r of res.results){ // @ts-ignore
      const idRaw: string = r.id; if(!idRaw) continue;
      const compact = idRaw.replaceAll("-", ""); if(!seen.has(compact)){ seen.add(compact); return compact; }
    }
  }
  return null;
}
