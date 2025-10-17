export interface Study { id:string; name:string; status?:string|null; }
export interface Course { id:string; name:string; studyIds?:string[]; status?:string|null; }
export interface Module { id:string; name:string; courseIds?:string[]; status?:string|null; order?:number|null; }
export interface Lesson { id:string; name:string; moduleIds?:string[]; status?:string|null; order?:number|null; }
export interface Session { id:string; name:string; lessonIds?:string[]; start?:string|null; end?:string|null; durationMin?:number|null; notes?:string|null; }
