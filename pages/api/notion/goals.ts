import type { NextApiRequest, NextApiResponse } from "next";
import { notion, assertEnv, getDbId } from "./common";
import { mapGoal } from "../../../lib/notion/map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    assertEnv(); const DB=getDbId("UB_DB_GOALS_ID");
    const r=await notion.databases.query({ database_id:DB, page_size:50 });
    res.status(200).json({ items:r.results.map(mapGoal) });
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
