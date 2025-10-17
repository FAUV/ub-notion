import type { NextApiRequest, NextApiResponse } from "next";
import { notion, assertEnv, getDbId } from "./common";
import { mapContent } from "../../../lib/notion/map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    assertEnv(); const DB=getDbId("UB_DB_CONTENT_ID");
    if(req.method==="GET"){
      const r=await notion.databases.query({ database_id:DB, page_size:50, sorts:[{ property:"Publish Date", direction:"descending" }]});
      res.status(200).json({ items:r.results.map(mapContent) }); return;
    }
    res.setHeader("Allow","GET"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
