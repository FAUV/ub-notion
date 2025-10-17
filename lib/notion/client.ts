import { Client } from "@notionhq/client";
export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2025-09-03" });
export function assertEnv(){ if(!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido"); }
