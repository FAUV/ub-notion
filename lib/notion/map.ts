import type { Task, Project, Note, ContentItem, Goal } from "./types";
function title(p:any){return p.Name?.title?.[0]?.plain_text ?? p.Name?.title?.[0]?.text?.content ?? "";}
function sel(p:any,k:string){return p[k]?.select?.name ?? null;}
function ms(p:any,k:string){return p[k]?.multi_select?.map((x:any)=>x.name) ?? [];}
function d(p:any,k:string){return p[k]?.date?.start ?? null;}
function cb(p:any,k:string){return Boolean(p[k]?.checkbox ?? false);}
function rel(p:any,k:string){return p[k]?.relation?.map((x:any)=>x.id) ?? [];}
export function mapTask(page:any):Task{const p=page.properties;return { id:page.id, name:title(p),
  status:sel(p,"Status")??sel(p,"Estado")??null, due:d(p,"Due")??d(p,"Fecha límite")??null,
  doDate:d(p,"Do Date")??d(p,"Fecha de ejecución")??null, priority:sel(p,"Priority")??sel(p,"Prioridad")??null,
  projectIds: rel(p,"Project").concat(rel(p,"Proyecto")), noteIds: rel(p,"Notes").concat(rel(p,"Notas")),
  tags: ms(p,"Tags").concat(ms(p,"Etiquetas")), completed: cb(p,"Completed")||cb(p,"Completado"), }; }
export function mapProject(page:any):Project{const p=page.properties;return { id:page.id, name:title(p),
  status:sel(p,"Status")??sel(p,"Estado")??null, start:d(p,"Start")??d(p,"Inicio")??null, end:d(p,"End")??d(p,"Fin")??d(p,"Target Deadline")??null,
  progress:(p["Progress"]?.number ?? null) as number|null, tagIds: rel(p,"Tag").concat(rel(p,"Tags")).concat(rel(p,"Etiquetas")), }; }
export function mapNote(page:any):Note{const p=page.properties;return { id:page.id, name:title(p),
  projectIds: rel(p,"Project").concat(rel(p,"Proyecto")), tags: ms(p,"Tags").concat(ms(p,"Etiquetas")),
  type: sel(p,"Type")??sel(p,"Tipo")??null, url: p["URL"]?.url ?? p["Enlace"]?.url ?? null,
  created: p["Created"]?.created_time ?? null, updated: p["Updated"]?.last_edited_time ?? null, }; }
export function mapContent(page:any):ContentItem{const p=page.properties;return { id:page.id, name:title(p),
  status:sel(p,"Status")??sel(p,"Estado")??null, mediaType:sel(p,"Media Type")??sel(p,"Tipo de Medio")??null,
  publishDate:d(p,"Publish Date")??d(p,"Fecha de Publicación")??null, reviewDate:d(p,"Review Date")??d(p,"Fecha de Revisión")??null,
  paid: cb(p,"Paid") || cb(p,"Pagado"), }; }
export function mapGoal(page:any):Goal{const p=page.properties;return { id:page.id, name:title(p),
  timeframe:sel(p,"Timeframe")??sel(p,"Plazo")??null, projectIds: rel(p,"Projects").concat(rel(p,"Proyectos")),
  progress:(p["Progress"]?.number ?? null) as number|null, }; }
