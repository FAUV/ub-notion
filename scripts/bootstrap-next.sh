#!/usr/bin/env bash
set -euo pipefail

echo "▶ Registry npm público"
npm config set registry https://registry.npmjs.org/

echo "▶ Actualizando package.json (Next, React, TanStack, Capacitor, scripts)"
node - <<'NODE'
const fs = require('fs'); const p='package.json'; const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.dependencies=j.dependencies||{}; j.devDependencies=j.devDependencies||{}; j.scripts=j.scripts||{};
// Next + React
if(!j.dependencies.react) j.dependencies.react='^18.3.1';
if(!j.dependencies['react-dom']) j.dependencies['react-dom']='^18.3.1';
if(!j.devDependencies.next && !j.dependencies.next) j.devDependencies.next='^14.2.33'; // LTS estable parcheada
// TanStack: corrige paquete inexistente
delete j.dependencies['@tanstack/react-query-persister-indexeddb'];
if(!j.dependencies['@tanstack/query-sync-storage-persister']) j.dependencies['@tanstack/query-sync-storage-persister']='^5.56.2';
if(!j.dependencies['@tanstack/react-query-persist-client']) j.dependencies['@tanstack/react-query-persist-client']='^5.56.2';
// Capacitor
if(!j.dependencies['@capacitor/core']) j.dependencies['@capacitor/core']='^6.1.0';
if(!j.devDependencies['@capacitor/cli']) j.devDependencies['@capacitor/cli']='^6.1.0';
// Scripts Next
j.scripts.dev = j.scripts.dev || "next dev";
j.scripts.build = j.scripts.build || "next build";
j.scripts.start = j.scripts.start || "next start -p 3000";
// Capacitor (server.url: se establece en el paso 3)
j.scripts['cap:init']  = j.scripts['cap:init']  || "npx cap init ub-notion com.fauv.ubnotion --web-dir=out --npm-client=npm || true";
j.scripts['cap:copy']  = j.scripts['cap:copy']  || "npx cap copy";
j.scripts['cap:sync']  = j.scripts['cap:sync']  || "npx cap sync";
j.scripts['ios:add']   = j.scripts['ios:add']   || "npx cap add ios";
j.scripts['ios:open']  = j.scripts['ios:open']  || "npx cap open ios";
fs.writeFileSync(p, JSON.stringify(j,null,2)); console.log('✔ package.json listo');
NODE

echo "▶ PWA: manifest + SW + icono iOS"
mkdir -p public
cat > public/manifest.webmanifest <<'JSON'
{
  "name": "ub-notion",
  "short_name": "ub-notion",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "fullscreen"],
  "background_color": "#0b1220",
  "theme_color": "#0ea5e9",
  "icons": [
    { "src": "/pwa-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
JSON
: > public/pwa-192.png; : > public/pwa-512.png; : > public/maskable-512.png
: > public/apple-touch-icon.png

cat > public/sw.js <<'JS'
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
JS

echo "▶ Inyección PWA en Next (App Router o Pages Router)"
if [ -d "app" ]; then
  # App Router: crea util de registro SW y meta iOS via layout wrapper si no existe
  mkdir -p app
  if [ ! -f app/pwa-provider.tsx ]; then
    cat > app/pwa-provider.tsx <<'TSX'
'use client'
import { useEffect, type PropsWithChildren } from 'react'
export function PWAProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])
  return <>{children}</>
}
TSX
    echo "✔ app/pwa-provider.tsx creado"
  fi
  # avisar al usuario para añadir tags y provider en app/layout.tsx
  echo "ℹ Abre app/layout.tsx y añade:"
  echo "  - <link rel='manifest' href='/manifest.webmanifest' />"
  echo "  - metas iOS: apple-mobile-web-app-*, apple-touch-icon"
  echo "  - envuelve {children} con <PWAProvider>...</PWAProvider>"
else
  # Pages Router: _document.tsx + _app.tsx
  mkdir -p pages
  if [ ! -f pages/_document.tsx ]; then
    cat > pages/_document.tsx <<'TSX'
import Document, { Html, Head, Main, NextScript } from 'next/document'
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ub-notion" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </Head>
        <body><Main /><NextScript /></body>
      </Html>
    )
  }
}
TSX
    echo "✔ pages/_document.tsx creado"
  fi
  if [ ! -f pages/_app.tsx ]; then
    cat > pages/_app.tsx <<'TSX'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css' // crea el archivo si no existe
export default function App({ Component, pageProps }: AppProps) {
  useEffect(()=>{ if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js') }},[])
  return <Component {...pageProps} />
}
TSX
    echo "✔ pages/_app.tsx creado"
  fi
fi

echo "▶ Capacitor config (server.url) – generando capacitor.config.ts"
cat > capacitor.config.ts <<'TS'
import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.fauv.ubnotion',
  appName: 'ub-notion',
  webDir: 'out',
  server: {
    // Usa tu dominio de producción (PWA real) para TestFlight
    url: process.env.CAP_SERVER_URL || 'https://YOUR_PROD_DOMAIN',
    iosScheme: 'capacitor',
    androidScheme: 'https',
    cleartext: false,
    hostname: 'ub-notion.local'
  },
  ios: { contentInset: 'automatic' }
}
export default config
TS

echo "▶ Seguridad: asegura que .env.local esté ignorado"
grep -qE '^\.env\.local$' .gitignore || echo ".env.local" >> .gitignore

echo "▶ Instalación limpia"
rm -rf node_modules package-lock.json
npm i

echo "✅ Bootstrap Next+PWA+Capacitor completado."
echo "Siguiente:"
echo "  1) Define CAP_SERVER_URL con tu dominio de producción (Vercel/Netlify):"
echo "     export CAP_SERVER_URL='https://tu-dominio.com'"
echo "  2) npm run build"
echo "  3) npm run cap:init && npm run ios:add && npm run cap:sync && npm run ios:open"
echo "  4) En Xcode: Team/Signing → Archive → Upload → TestFlight"
