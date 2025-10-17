import { Client } from "@notionhq/client";
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03", // compatible con tokens ntn_ y multi-source DB
});
export function assertEnv(){
  if(!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN no definido");
}
