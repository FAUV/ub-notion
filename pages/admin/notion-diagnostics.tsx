import { useEffect, useState } from "react";
type Check = { name:string; url:string; ok?:boolean; error?:string; count?:number; resolved?:boolean; dbId?:string };
export default function NotionDiagnostics(){
  const [rows,setRows]=useState<Check[]>([
    { name:"Tasks (today)", url:"/api/notion/tasks?view=today" },
    { name:"Projects", url:"/api/notion/projects" },
    { name:"Notes", url:"/api/notion/notes" },
    { name:"Content", url:"/api/notion/content" },
    { name:"Goals", url:"/api/notion/goals" },
    { name:"Studies", url:"/api/notion/studies" },
    { name:"Courses", url:"/api/notion/courses" },
    { name:"Modules", url:"/api/notion/modules" },
    { name:"Lessons", url:"/api/notion/lessons" },
    { name:"Sessions", url:"/api/notion/sessions" },
  ]);
  useEffect(()=>{ (async ()=>{
    const out:Check[]=[]; for(const r of rows){
      try{ const res=await fetch(r.url); const json=await res.json();
        if(res.ok) out.push({ ...r, ok:true, count:Array.isArray(json.items)?json.items.length:undefined, resolved: json.resolved, dbId: json.dbId });
        else out.push({ ...r, ok:false, error: json.error||String(res.status) });
      }catch(e:any){ out.push({ ...r, ok:false, error: e.message }); }
    }
    setRows(out);
  })(); /* eslint-disable-next-line */ },[]);
  return (
    <div style={{maxWidth:960, margin:"40px auto", padding:"0 16px", fontFamily:"system-ui, -apple-system"}}>
      <h1>Notion Diagnostics</h1>
      <p>Si una fila falla con <code>unauthorized</code>, comparte esa base en Notion con tu integración. Si dice <code>Falta UB_DB_...</code> y <code>resolved:false</code>, agrega ese ID en Vercel/.env.local o renombra tu base (ES/EN) para autodescubrimiento.</p>
      <table width="100%" cellPadding={8} style={{borderCollapse:"collapse"}}>
        <thead><tr><th align="left">Check</th><th>OK</th><th align="right">Items</th><th align="left">DB ID</th><th>Resolved</th><th align="left">Error</th></tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i} style={{borderTop:"1px solid #ddd"}}>
            <td>{r.name}</td><td>{String(r.ok)}</td><td align="right">{r.count ?? "-"}</td>
            <td>{r.dbId ?? "-"}</td><td>{r.resolved? "true":"-"}</td><td>{r.error ?? "-"}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
