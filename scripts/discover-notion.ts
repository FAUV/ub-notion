import { Client } from "@notionhq/client";
import fs from "node:fs"; import path from "node:path";
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CANDS = ["Tareas","Notas","Proyectos","Etiquetas","Contenido","Objetivos","Metas","Áreas","People","Books","Recipes","Studies","Tasks","Notes","Projects","Tags","Content","Goals","Creator's Companion","Content Calendar"];
async function search(q:string){return notion.search({query:q,filter:{value:"database",property:"object"},sort:{direction:"descending",timestamp:"last_edited_time"},page_size:100});}
async function retr(id:string){ // @ts-ignore
  return notion.databases.retrieve({ database_id:id });
}
async function main(){
  if(!process.env.NOTION_TOKEN) throw new Error("Define NOTION_TOKEN");
  const out=path.join(process.cwd(),"output"); const schemas=path.join(out,"schemas"); fs.mkdirSync(schemas,{recursive:true});
  const found:Record<string,any>={}; const seen=new Set<string>();
  for(const n of CANDS){const r=await search(n);
    for(const it of r.results){ // @ts-ignore
      const title=(it.title?.[0]?.plain_text ?? n) as string; const raw=(it.id as string); const id=raw.replaceAll("-","");
      if(seen.has(id)) continue; seen.add(id); found[title]={ id, url:(it as any).url };
      const db=await retr(raw); fs.writeFileSync(path.join(schemas, `${title}.json`), JSON.stringify(db,null,2));
    }
  }
  const map=Object.fromEntries(Object.entries(found).map(([k,v]:any)=>[k.toUpperCase().replaceAll(" ","_").replaceAll("Á","A").replaceAll("É","E").replaceAll("Í","I").replaceAll("Ó","O").replaceAll("Ú","U").replaceAll("'",""), v]));
  fs.writeFileSync(path.join(out,"dbmap.json"), JSON.stringify(map,null,2));
  const env = Object.entries(map).map(([k,v]:any)=>`UB_DB_${k}_ID=${v.id}`).join("\\n")+"\\n";
  fs.writeFileSync(path.join(out,"env.suggested"), env);
  console.log("OK - output/dbmap.json, output/schemas/*, output/env.suggested");
}
main().catch(e=>{console.error(e);process.exit(1);});
