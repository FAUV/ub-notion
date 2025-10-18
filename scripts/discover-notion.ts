#!/usr/bin/env ts-node
import { Client } from "@notionhq/client";
import * as fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2025-09-03" });
function norm(id:string){ return (id||"").toLowerCase(); }

async function searchDataSources(q:string){
  const r = await notion.request({
    method: "post",
    path: "search",
    body: { query:q, filter:{ value:"data_source", property:"object" }, sort:{ direction:"descending", timestamp:"last_edited_time" }, page_size: 20 }
  }) as any;
  return r.results as any[];
}

async function getDataSource(dsId:string){
  const id = norm(dsId);
  return await notion.request({ method:"get", path:`data_sources/${id}` }) as any;
}

async function main(){
  if(!process.env.NOTION_TOKEN) throw new Error("Define NOTION_TOKEN");
  const candidates = [
    "Estudios","Studies","Cursos","Courses","Módulos","Modulos","Modules","Lecciones","Lessons","Sesiones","Sessions",
    "Tareas","Tasks","Proyectos","Projects","Notas","Notes","Contenido","Content","Objetivos","Goals","Etiquetas","Tags"
  ];
  const found: Record<string,string> = {};
  const seen = new Set<string>();

  for(const q of candidates){
    const hits = await searchDataSources(q);
    for(const h of hits){
      if(seen.has(h.id)) continue; seen.add(h.id);
      const title = h?.title?.[0]?.plain_text || "";
      try { await getDataSource(h.id); } catch { /* ignore */ }
      const id = norm(h.id);
      if(/curso|course/i.test(title)) found.UB_DB_COURSES_ID = id;
      if(/m[oó]dulo|module/i.test(title)) found.UB_DB_MODULES_ID = id;
      if(/lecci[oó]n|lesson/i.test(title)) found.UB_DB_LESSONS_ID = id;
      if(/sesi[oó]n|session/i.test(title)) found.UB_DB_SESSIONS_ID = id;
      if(/estudio|study/i.test(title)) found.UB_DB_STUDIES_ID = id;
      if(/tarea|task/i.test(title)) found.UB_DB_TASKS_ID = id;
      if(/proyecto|project/i.test(title)) found.UB_DB_PROJECTS_ID = id;
      if(/nota|note/i.test(title)) found.UB_DB_NOTES_ID = id;
      if(/contenido|content/i.test(title)) found.UB_DB_CONTENT_ID = id;
      if(/objetivo|goal/i.test(title)) found.UB_DB_GOALS_ID = id;
      if(/etiqueta|tag/i.test(title)) found.UB_DB_TAGS_ID = id;
    }
  }

  const lines = [
    "# === Sugerido por discover (DATA SOURCE IDs) ===",
    ...Object.entries(found).map(([k,v])=>`${k}=${v}`)
  ].join("\n");
  fs.mkdirSync("output", { recursive:true });
  fs.writeFileSync("output/env.suggested", lines+"\n", "utf8");
  console.log("\n>> output/env.suggested\n"+lines+"\n");
}

main().catch(e=>{ console.error(e); process.exit(1); });
