import type { NextApiRequest, NextApiResponse } from "next";
import { notion, assertEnv, getDbId } from "./common";
import { mapNote } from "../../../lib/notion/map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    assertEnv(); const DB=getDbId("UB_DB_NOTES_ID");
    if(req.method==="GET"){
      const r=await notion.databases.query({ database_id:DB, page_size:50, sorts:[{ timestamp:"last_edited_time", direction:"descending" }]});
      res.status(200).json({ items:r.results.map(mapNote) }); return;
    }
    if(req.method==="POST"){
      const b=req.body??{};
      const properties:any={
        Name:{ title:[{ text:{ content:b.name??"Untitled" } }] }
      };
      if(b.url){
        properties.URL={ url:b.url };
      }
      const created=await notion.pages.create({ parent:{ database_id:DB }, properties });
      res.status(201).json({ item:mapNote(created) }); return;
    }
    res.setHeader("Allow","GET,POST"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
