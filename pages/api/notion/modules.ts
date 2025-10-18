import type { NextApiRequest, NextApiResponse } from "next";
import { notion, findDbIdByNames, buildProps, normalizePageId, normalizeUuid, queryDataSource } from "./common";
import { mapModule } from "../../../lib/notion/study-map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    let DS = process.env.UB_DB_MODULES_ID as string | undefined; if(DS) DS=normalizeUuid(DS); else DS = await findDbIdByNames(["Módulos","Modulos","Modules"]) || undefined;
    if(!DS) throw new Error("Falta UB_DB_MODULES_ID y no se pudo resolver 'Módulos/Modules'");

    if(req.method==="GET"){
      const r = await queryDataSource(DS, { sorts:[{ timestamp:"last_edited_time", direction:"descending" }] });
      res.status(200).json({ items: r.results.map(mapModule), dbId: DS, resolved: !process.env.UB_DB_MODULES_ID }); return;
    }

    if(req.method==="POST"){
      const b=req.body??{}; const props = await buildProps(DS, { name:b.name, status:b.status, order: typeof b.order==='number'?b.order:undefined, relations:[{ keyCandidates:["Course","Curso"], ids:Array.isArray(b.courseIds)?b.courseIds:[] }] });
      const created = await notion.request({ method:"post", path:"pages", body:{ parent:{ type:"data_source_id", data_source_id: DS }, properties: props } }) as any;
      res.status(201).json({ item: mapModule(created) }); return;
    }

    if(req.method==="PATCH"){
      const raw = String(req.query.id||""); if(!raw) return res.status(400).json({ error:"Falta id" });
      const id = normalizePageId(raw); const b=req.body??{}; const props = await buildProps(DS, { name:b.name, status:b.status, order: typeof b.order==='number'?b.order:undefined, relations:[{ keyCandidates:["Course","Curso"], ids:Array.isArray(b.courseIds)?b.courseIds:[] }] });
      const updated = await notion.pages.update({ page_id:id, properties: props });
      res.status(200).json({ item: mapModule(updated) }); return;
    }

    res.setHeader("Allow","GET,POST,PATCH"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
