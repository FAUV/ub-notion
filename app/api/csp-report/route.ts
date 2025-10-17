import { NextResponse } from 'next/server'
export async function POST(req: Request){
  try{ const body = await req.json().catch(()=>null); console.warn("CSP report:", JSON.stringify(body)); }catch(e){ console.warn("CSP report parse error"); }
  return NextResponse.json({ ok:true })
}
