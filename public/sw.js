// Production PWA SW — versioned caches, clean upgrades, sane strategies.
const VERSION='v3.3';
const SHELL_CACHE=`shell-${VERSION}`;
const ASSET_CACHE=`assets-${VERSION}`;
const RUNTIME_CACHE=`runtime-${VERSION}`;
const SHELL=['/','/manifest.webmanifest','/offline'];

self.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',(event)=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![SHELL_CACHE,ASSET_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',(event)=>{ if(event.data&&event.data.type==='SKIP_WAITING'){ self.skipWaiting(); }});

function isHTML(req){ return req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');}
function isAsset(req){ const d=req.destination; return ['style','script','font','image'].includes(d);}

self.addEventListener('fetch',(event)=>{
  const req=event.request; const url=new URL(req.url);
  if(isHTML(req)){
    event.respondWith(fetch(req).then(res=>{ caches.open(SHELL_CACHE).then(c=>c.put('/',res.clone())).catch(()=>{}); return res; }).catch(()=>caches.match('/offline')||caches.match('/')));
    return;
  }
  if(url.origin===self.location.origin && isAsset(req)){
    event.respondWith(caches.open(ASSET_CACHE).then(async c=>{ const hit=await c.match(req); const net=fetch(req).then(res=>{ c.put(req,res.clone()); return res; }).catch(()=>hit); return hit||net; }));
    return;
  }
  if(url.pathname.startsWith('/api/')){
    event.respondWith(fetch(req).then(res=>{ caches.open(RUNTIME_CACHE).then(c=>c.put(req,res.clone())).catch(()=>{}); return res; }).catch(()=>caches.match(req)));
    return;
  }
});
