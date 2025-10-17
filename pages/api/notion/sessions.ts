import type { NextApiRequest, NextApiResponse } from "next";
import { notion, findDbIdByNames } from "./common";
import { mapSession } from "../../../lib/notion/study-map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    let DB = process.env.UB_DB_SESSIONS_ID as string | undefined;
    if(!DB){ DB = await findDbIdByNames(["Sesiones","Sessions"]) || undefined; }
    if(!DB) throw new Error("Falta UB_DB_SESSIONS_ID y no se pudo resolver 'Sesiones/Sessions'");
    const r=await notion.databases.query({ database_id:DB, page_size:100, sorts:[{ timestamp:"last_edited_time", direction:"descending" }]});
    res.status(200).json({ items: r.results.map(mapSession), dbId: DB, resolved: !process.env.UB_DB_SESSIONS_ID });
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
