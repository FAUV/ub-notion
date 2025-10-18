import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2025-09-03" });

function normId(s?: string){ return (s||"").trim(); }
function titleFromPage(p:any): string{
  const props = p?.properties ?? {};
  for (const [k,v] of Object.entries<any>(props)){
    if (v?.type === "title"){
      const arr = v.title as any[]; 
      const txt = (arr||[]).map(t=>t?.plain_text||t?.text?.content||"").join("").trim();
      return txt || k;
    }
  }
  return p?.id || "(sin título)";
}

async function diagOne(label:string, envKey:string){
  const id = normId(process.env[envKey]);
  if (!id){ console.log(`- ${label}: falta ${envKey} en .env.local`); return; }

  try{
    // esquema del data source
    const ds = await notion.request({ method:"get", path:`data_sources/${id}` }) as any;
    const dsTitle = ds?.title?.[0]?.plain_text ?? "(sin título)";
    const propNames = Object.keys(ds?.properties ?? {});
    // primeras filas
    const q = await notion.request({
      method:"post", path:`data_sources/${id}/query`,
      body:{ page_size: 5, sorts:[{ timestamp:"last_edited_time", direction:"descending" }] }
    }) as any;
    const rows = (q?.results??[]).map(titleFromPage);

    console.log(`\n[${label}] ${dsTitle}`);
    console.log(`  id: ${id}`);
    console.log(`  propiedades: ${propNames.join(", ") || "(ninguna)"}`);
    console.log(`  filas: ${q?.results?.length ?? 0} (mostrando hasta 5)`);
    rows.forEach((t:string,i:number)=>console.log(`    - ${i+1}. ${t}`));
  }catch(e:any){
    console.log(`\n[${label}] ERROR → ${e?.body || e?.message || e}`);
    console.log(`  Pistas: verifica que compartiste la base ORIGINAL con la integración y que el id es de data source (no linked db).`);
  }
}

(async()=>{
  const targets = [
    ["Estudios", "UB_DB_STUDIES_ID"],
    ["Cursos", "UB_DB_COURSES_ID"],
    ["Módulos", "UB_DB_MODULES_ID"],
    ["Lecciones", "UB_DB_LESSONS_ID"],
    ["Sesiones", "UB_DB_SESSIONS_ID"],
    ["Proyectos", "UB_DB_PROJECTS_ID"],
    ["Tareas", "UB_DB_TASKS_ID"],
    ["Notas", "UB_DB_NOTES_ID"],
    ["Contenido", "UB_DB_CONTENT_ID"],
    ["Objetivos", "UB_DB_GOALS_ID"],
    ["Etiquetas", "UB_DB_TAGS_ID"],
  ];
  console.log("== Diagnóstico de Data Sources (.env.local) ==");
  for (const [label,key] of targets) await diagOne(label,key);
})();
