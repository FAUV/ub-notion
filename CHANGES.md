# Summary
- Move to Next.js 14.2.33 (patched advisories) and align tooling: `eslint-config-next@14.2.33`, lint/typecheck scripts, `.nvmrc` + `package.json` engines for Node 20.
- Production PWA setup: offline route, SW v3.3 caches, App Update toast, `PWAProvider`, manifest + apple meta tags, and generated icon set.
- Add health & CSP-report API endpoints, security headers (CSP Report-Only, COOP/COEP/CORP), and CI workflow (Node 20/22 matrix).
- Capacitor configuration/scripts for iOS wrapper (server.url bridge), iOS helper docs, and release automation.
- Tighten React hooks by memoizing `syncAll` and debouncing search refresh without violating exhaustive deps.

# Runbooks
## Web (PWA)
1. `npm run dev` – local development.
2. `npm run lint && npm run typecheck` – quality gates.
3. `npm run build` – production bundle (Next.js App Router).
4. Deploy via preferred host (Vercel/Netlify/Cloudflare) pointing to the Next build output; ensure `/public/manifest.webmanifest` and `/public/sw.js` are served at the root.

## iOS (Capacitor, TestFlight wrapper)
1. Set the production PWA entry point: `export CAP_SERVER_URL='https://your-prod-domain'`.
2. Build web assets: `npm run build`.
3. Initialize & sync Capacitor (idempotent): `npm run cap:init && npm run ios:add && npm run cap:sync && npm run ios:open`.
4. In Xcode: select a Team + Signing, target iOS 15+, Archive → Distribute App → App Store Connect → Upload.

## Security / Secrets Hygiene
- `.env.local` is ignored; copy `.env.local.example` and fill real values locally.
- **Token rotation:** Revoke the previously exposed Notion token in the Notion Integrations console and issue a fresh token. Store it only in local `.env.local` or your secrets manager.
- Recommended history cleanup (if required): `git filter-repo --path env.local --invert-paths` or `bfg --delete-files env.local`.
