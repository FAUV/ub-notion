import type { Study, Course, Module, Lesson, Session } from "./study-types";
function t(p:any){return p.Name?.title?.[0]?.plain_text ?? p.Name?.title?.[0]?.text?.content ?? "";}
function sel(p:any,k:string){return p[k]?.select?.name ?? null;}
function num(p:any,k:string){const v=p[k]?.number; return typeof v==="number"?v:null;}
function rel(p:any,k:string){return p[k]?.relation?.map((x:any)=>x.id) ?? [];}
function date(p:any,k:string){return p[k]?.date?.start ?? null;}
function text(p:any,k:string){return p[k]?.rich_text?.[0]?.plain_text ?? null;}
export function mapStudy(page:any):Study{const p=page.properties;return{ id:page.id, name:t(p), status:sel(p,"Status")??sel(p,"Estado")??null };}
export function mapCourse(page:any):Course{const p=page.properties;return{ id:page.id, name:t(p), status:sel(p,"Status")??sel(p,"Estado")??null, studyIds: rel(p,"Study").concat(rel(p,"Estudio")) };}
export function mapModule(page:any):Module{const p=page.properties;return{ id:page.id, name:t(p), status:sel(p,"Status")??sel(p,"Estado")??null, order: num(p,"Order")??num(p,"Orden"), courseIds: rel(p,"Course").concat(rel(p,"Curso")) };}
export function mapLesson(page:any):Lesson{const p=page.properties;return{ id:page.id, name:t(p), status:sel(p,"Status")??sel(p,"Estado")??null, order: num(p,"Order")??num(p,"Orden"), moduleIds: rel(p,"Module").concat(rel(p,"Módulo")).concat(rel(p,"Modulo")) };}
export function mapSession(page:any):Session{const p=page.properties;return{ id:page.id, name:t(p), lessonIds: rel(p,"Lesson").concat(rel(p,"Lección")).concat(rel(p,"Leccion")), start: date(p,"Start")??date(p,"Inicio"), end: date(p,"End")??date(p,"Fin"), durationMin: num(p,"Duration (min)")??num(p,"Duración (min)"), notes: text(p,"Notes")??text(p,"Notas") };}
