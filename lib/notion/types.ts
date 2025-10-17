export interface Task { id:string; name:string; status?:string|null; due?:string|null; doDate?:string|null; priority?:string|null; projectIds?:string[]; noteIds?:string[]; tags?:string[]; completed?:boolean; }
export interface Project { id:string; name:string; status?:string|null; start?:string|null; end?:string|null; progress?:number|null; tagIds?:string[]; }
export interface Note { id:string; name:string; projectIds?:string[]; tags?:string[]; type?:string|null; url?:string|null; created?:string|null; updated?:string|null; }
export interface ContentItem { id:string; name:string; status?:string|null; mediaType?:string|null; publishDate?:string|null; reviewDate?:string|null; paid?:boolean|null; }
export interface Goal { id:string; name:string; timeframe?:string|null; projectIds?:string[]; progress?:number|null; }
