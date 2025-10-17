import type { NextApiRequest, NextApiResponse } from "next";
import { notion, assertEnv, getDbId } from "./common";
import { mapProject } from "../../../lib/notion/map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    assertEnv(); const DB=getDbId("UB_DB_PROJECTS_ID");
    if(req.method==="GET"){
      const status=(req.query.status as string)|undefined;
      const filter = status ? { property:"Status", status:{ equals:status } } : undefined;
      const r=await notion.databases.query({ database_id:DB, filter, sorts:[{ property:"Status", direction:"ascending" }], page_size:50 });
      res.status(200).json({ items:r.results.map(mapProject) }); return;
    }
    res.setHeader("Allow","GET"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
