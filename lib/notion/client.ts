import { Client } from "@notionhq/client";
export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export function assertEnv() {
  if (!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido. Configura .env.local o variables en Vercel.");
}
