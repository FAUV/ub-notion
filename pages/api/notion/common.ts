import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";
export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export function assertEnv(){ if(!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido"); }
export function getDbId(envKey:string){ const v=process.env[envKey]; if(!v) throw new Error(`Falta ${envKey}`); return v; }
export type Handler = (req:NextApiRequest,res:NextApiResponse)=>Promise<void>;
