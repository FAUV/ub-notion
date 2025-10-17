import type { NextApiRequest, NextApiResponse } from "next";
import { notion } from "./common";
import { mapCourse } from "../../../lib/notion/study-map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    const DB=process.env.UB_DB_COURSES_ID as string;
    if(!DB) throw new Error("Falta UB_DB_COURSES_ID");
    const r=await notion.databases.query({ database_id:DB, page_size:100, sorts:[{ timestamp:"last_edited_time", direction:"descending" }]});
    res.status(200).json({ items: r.results.map(mapCourse) });
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
