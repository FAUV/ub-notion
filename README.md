# Ultimate Brain – Notion Control Center (Prod Ready)

Repo listo para desplegar en **Vercel** o **Docker**. Incluye:
- App Router (Next.js) con **Tailwind**.
- UI completa (Estudios + mapping recursivo + búsqueda + expansión de relaciones).
- **SDK Notion** con endpoints `/api/ub/*` y utilidades.
- **Rate limit** + **API key** opcional.
- **GitHub Actions** (build, typecheck, lint y despliegue opcional a Vercel si hay secretos).
- **Dockerfile** multi-stage.
- Script para **empujar a GitHub** desde tu máquina con un token.

## Puesta en marcha local
```bash
npm install          # usa pnpm/yarn si prefieres
cp .env.local.example .env.local
# Rellena NOTION_TOKEN y (opcional) UB_API_KEY
npm run dev
```

## Variables de entorno (/.env.local)
- `NOTION_TOKEN` (requerido): token de integración de Notion.
- `NOTION_TIMEZONE` (opcional, por defecto America/Santiago).
- `UB_API_KEY` (opcional): si se define, los endpoints exigirán `x-api-key` o `?api_key=`.
- `NEXT_PUBLIC_UB_API_KEY` (opcional): expuesto al cliente, se usa para llamar a `/api/ub/*`.
- `UB_MAPPING_PATH` (opcional): ruta absoluta donde persistir el mapping si no quieres el valor por defecto.
- `VERCEL_*` (opcional para CI/CD): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Persistencia del mapping
- Por defecto, el archivo de mapeo se crea como `.ub_mapping.json` en el directorio del proyecto.
- En despliegues de solo lectura (p. ej. Vercel) el backend no puede escribir ahí, por lo que se utiliza automáticamente `/tmp/ub_mapping.json`.
- Puedes forzar otra ubicación estableciendo la variable `UB_MAPPING_PATH`. Asegúrate de que el directorio sea escribible.
- Recuerda que `/tmp` se borra en cada reinicio del contenedor/serverless, por lo que conviene rehidratar el mapping en cada despliegue.

## Despliegue con Vercel (CI/CD)
1. Crea repo en GitHub y **sube** este código (ver `scripts/push_to_github.sh`).
2. En GitHub → *Settings → Secrets and variables → Actions*, añade:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - (opcional) `UB_API_KEY`, `NOTION_TOKEN` (puedes añadir también como *Environment secrets*)
3. La acción **Deploy to Vercel** se ejecutará en `main`.

## Despliegue con Docker
```bash
docker build -t ub-notion:prod .
docker run -p 3000:3000 --env-file .env.local ub-notion:prod
```

## Empujar a GitHub desde tu máquina
```bash
bash scripts/push_to_github.sh YOUR_GITHUB_USERNAME your-repo-name
# Requiere exportar GITHUB_TOKEN con permisos repo
```

## Notas de producción
- Se requiere Node.js 20.x (`.nvmrc` incluido); CI valida en Node 20 y 22.
- El `service worker` (`public/sw.js`) cachea shell + assets y se combina con `/offline` y el toast `app/app-update-toast.tsx`.
- Sustituye los íconos de `public/*.png` por arte real antes de publicar.
- Establece `CAP_SERVER_URL` (dominio HTTPS en producción) antes de empaquetar con Capacitor/iOS.
- Actualiza `next.config.mjs` con tu dominio real en la directiva CSP (`https://YOUR_PROD_DOMAIN`).
