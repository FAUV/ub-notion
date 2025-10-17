import fs from "node:fs"; import path from "node:path";
const expected: Record<string,string[]> = {
  "Tasks":["Name","Status","Due","Do Date","Priority","Project","Notes","Tags","Completed"],
  "Projects":["Name","Status","Start","End","Tasks","Notes","Goal","Progress","Tags"],
  "Notes":["Name","Project","Tags","Type","URL","Created","Updated"],
  "Goals":["Name","Timeframe","Projects","Progress"],
  "Content":["Name","Status","Media Type","Publish Date","Review Date","Paid","Project","Tags"],
  "Studies":["Name","Status"],
  "Courses":["Name","Status","Study"],
  "Modules":["Name","Status","Order","Course"],
  "Lessons":["Name","Status","Order","Module"],
  "Sessions":["Name","Lesson","Start","End","Duration (min)","Notes"]
};
function readSchemas(){const dir=path.join(process.cwd(),"output","schemas"); const files=fs.existsSync(dir)?fs.readdirSync(dir):[]; return files.map(f=>({name:f.replace(/\\.json$/,""), json:JSON.parse(fs.readFileSync(path.join(dir,f),"utf-8"))}));}
function norm(p:string){return p.trim().replace(/\\s+/g," ").replace(/’/g,"'");}
(function main(){
  const schemas=readSchemas(); const report:any[]=[];
  for(const s of schemas){const props=Object.keys(s.json.properties??{}).map(norm); const exp=expected[s.name]??[];
    const missing=exp.filter(x=>!props.includes(x)); const extras=props.filter(x=>!exp.includes(x));
    report.push({ database:s.name, missing, extras });
  }
  const out=path.join(process.cwd(),"output","validation.json"); fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out, JSON.stringify(report,null,2)); console.log("OK - validation -> output/validation.json");
})();
