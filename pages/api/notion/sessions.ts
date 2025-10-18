import type { NextApiRequest, NextApiResponse } from "next";
import { notion, findDbIdByNames, buildProps, normalizePageId, normalizeUuid, queryDataSource } from "./common";
import { mapSession } from "../../../lib/notion/study-map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    let DS = process.env.UB_DB_SESSIONS_ID as string | undefined; if(DS) DS=normalizeUuid(DS); else DS = await findDbIdByNames(["Sesiones","Sessions"]) || undefined;
    if(!DS) throw new Error("Falta UB_DB_SESSIONS_ID y no se pudo resolver 'Sesiones/Sessions'");

    if(req.method==="GET"){
      const r = await queryDataSource(DS, { sorts:[{ timestamp:"last_edited_time", direction:"descending" }] });
      res.status(200).json({ items: r.results.map(mapSession), dbId: DS, resolved: !process.env.UB_DB_SESSIONS_ID }); return;
    }

    if(req.method==="POST"){
      const b=req.body??{}; const props = await buildProps(DS, { name:b.name, start:b.start, end:b.end, durationMin: typeof b.durationMin==='number'?b.durationMin:undefined, notes:b.notes, relations:[{ keyCandidates:["Lesson","Lección","Leccion"], ids:Array.isArray(b.lessonIds)?b.lessonIds:[] }] });
      const created = await notion.request({ method:"post", path:"pages", body:{ parent:{ type:"data_source_id", data_source_id: DS }, properties: props } }) as any;
      res.status(201).json({ item: mapSession(created) }); return;
    }

    if(req.method==="PATCH"){
      const raw = String(req.query.id||""); if(!raw) return res.status(400).json({ error:"Falta id" });
      const id = normalizePageId(raw); const b=req.body??{}; const props = await buildProps(DS, { name:b.name, start:b.start, end:b.end, durationMin: typeof b.durationMin==='number'?b.durationMin:undefined, notes:b.notes, relations:[{ keyCandidates:["Lesson","Lección","Leccion"], ids:Array.isArray(b.lessonIds)?b.lessonIds:[] }] });
      const updated = await notion.pages.update({ page_id:id, properties: props });
      res.status(200).json({ item: mapSession(updated) }); return;
    }

    res.setHeader("Allow","GET,POST,PATCH"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
