
# ub-notion · PWA v3 (Máximo nivel)
- **Navegación separada** (Sidebar/Topbar) y **ViewBar** por página.
- **Kanban Pro** (dnd-kit) con swimlanes, WIP y filtros.
- **Timeline** (Recharts), **Calendar** mensual, **Dashboard** con KPIs (pie, área, burn-down).
- **Offline-first + Query Persistence** y **Outbox Sync** hacia API.
- **PWA** lista para producción (VitePWA).
- **A11y** (skip link, contraste), **Theme** light/dark.
- **E2E** con Playwright, **CI** GitHub Actions, **Dockerfile** + **Nginx** con headers de seguridad.

## Arranque
```bash
pnpm install
pnpm dev
```

## Producción
```bash
pnpm build && pnpm preview
```

## Importación de datos
Ve a cada página y usa **Importar CSV** con tus `*_FIXED.csv`. Los mapeos están listos.

## Sincronización (outbox)
- Cualquier operación local puede **enqueue** en `outbox` y el `syncEngine` empuja al backend (`POST /api/sync`).
- Estrategia por defecto: reintento y requeue; puedes implementar versión de conflicto (ETag/version) del lado servidor.

## Seguridad
- Usa `nginx.conf` con **CSP**, HSTS y otras cabeceras (ver `/deploy/nginx.conf`).

## Tests
- `pnpm e2e` ejecuta pruebas de Playwright (smoke).
