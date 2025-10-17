import type { NextApiRequest, NextApiResponse } from "next";
import { notion, assertEnv, getDbId } from "./common";
import { mapTask } from "../../../lib/notion/map";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    assertEnv(); const DB=getDbId("UB_DB_TASKS_ID");
    if(req.method==="GET"){
      const view=(req.query.view as string)??"inbox"; const nowISO=new Date().toISOString();
      let filter:any={};
      if(view==="today"){
        const d=nowISO.slice(0,10);
        filter={ or:[
          { property:"Do Date", date:{ equals:d } },
          { property:"Due", date:{ equals:d } },
          { property:"Fecha de ejecución", date:{ equals:d } },
          { property:"Fecha límite", date:{ equals:d } },
        ]};
      } else if(view==="week"){
        const start=new Date(); const end=new Date(); const wd=start.getDay(); start.setDate(start.getDate()-wd); end.setDate(start.getDate()+6);
        filter={ or:[
          { property:"Due", date:{ on_or_after:start.toISOString(), on_or_before:end.toISOString() } },
          { property:"Do Date", date:{ on_or_after:start.toISOString(), on_or_before:end.toISOString() } },
        ]};
      } else if(view==="month"){
        const d=new Date(); const start=new Date(d.getFullYear(),d.getMonth(),1); const end=new Date(d.getFullYear(),d.getMonth()+1,0);
        filter={ or:[
          { property:"Due", date:{ on_or_after:start.toISOString(), on_or_before:end.toISOString() } },
          { property:"Do Date", date:{ on_or_after:start.toISOString(), on_or_before:end.toISOString() } },
        ]};
      } else {
        filter={ and:[ { or:[
          { property:"Status", status:{ does_not_equal:"Completed" } },
          { property:"Estado", status:{ does_not_equal:"Completado" } },
        ]}]};
      }
      const r=await notion.databases.query({ database_id:DB, filter, sorts:[{ timestamp:"last_edited_time", direction:"descending" }], page_size:50 });
      res.status(200).json({ items:r.results.map(mapTask) }); return;
    }
    if(req.method==="POST"){
      const b=req.body??{}; const parent={ database_id:DB }; const props:any={ Name:{ title:[{ text:{ content:b.name??"Untitled" } }] } };
      if(b.status) props.Status={ status:{ name:b.status } };
      if(b.due) props["Due"]={ date:{ start:b.due } };
      if(b.doDate) props["Do Date"]={ date:{ start:b.doDate } };
      if(Array.isArray(b.projectIds)&&b.projectIds.length) props["Project"]={ relation:b.projectIds.map((id:string)=>({id})) };
      const created=await notion.pages.create({ parent, properties:props });
      res.status(201).json({ item:mapTask(created) }); return;
    }
    if(req.method==="PATCH"){
      const id=(req.query.id as string); if(!id) return res.status(400).json({ error:"Falta id" });
      const b=req.body??{}; const props:any={};
      if(b.name) props.Name={ title:[{ text:{ content:b.name } }] };
      if(b.status) props.Status={ status:{ name:b.status } };
      if(b.due) props["Due"]={ date:{ start:b.due } };
      if(b.doDate) props["Do Date"]={ date:{ start:b.doDate } };
      const updated=await notion.pages.update({ page_id:id, properties:props });
      res.status(200).json({ item:mapTask(updated) }); return;
    }
    res.setHeader("Allow","GET,POST,PATCH"); res.status(405).end("Method Not Allowed");
  }catch(e:any){res.status(500).json({ error:e.message??"error" });}
}
