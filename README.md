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
- `UB_OFFLINE` (opcional): ponlo en `true` para que las rutas `/api/ub/*` respondan en modo demo sin tocar Notion.
- `NEXT_PUBLIC_UB_OFFLINE` (opcional): ponlo en `true` para que la UI use datos locales y no haga `fetch` (ideal para costo cero en Vercel).
- `UB_MAPPING_BLOCK_ID` (opcional): ID de un bloque de código en Notion donde se persistirá el mapping (`json`).
- `UB_MAPPING_PAGE_ID` (opcional): alternativa al bloque; si se indica, se usará el primer bloque `code/json` de esa página para guardar el mapping.
- `VERCEL_*` (opcional para CI/CD): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

> **Nota:** si no configuras bloque/página, el mapping se seguirá guardando en `.ub_mapping.json` en el filesystem. Para despliegues en Vercel u otras plataformas serverless se recomienda usar Notion para persistencia duradera.

## Operación costo cero (modo demo)

Para garantizar que Vercel (u otro host) no genere cargos mientras exploras la interfaz:

1. Define `UB_OFFLINE=true` y `NEXT_PUBLIC_UB_OFFLINE=true` en tu `.env.local` y en las variables del despliegue (si aplica).
2. Con esas banderas activas, las rutas `/api/ub/*` responden con datos vacíos y bloquean POST/PATCH/DELETE, evitando llamadas a la API de Notion.
3. La UI detecta el modo demo, evita hacer `fetch` y muestra un banner “Modo demo sin llamadas a Notion”.
4. Si usas Vercel, deja deshabiladas las integraciones de Analytics/Speed Insights y realiza despliegues manuales (`vercel deploy`) sólo cuando quieras revisar cambios.
5. Puedes pausar (o eliminar) los workflows de GitHub Actions de despliegue automático para mantenerte siempre en la capa gratuita.

Con esta configuración, todo el tráfico queda en el navegador y no hay ejecución de funciones serverless, por lo que no se incurre en costes.

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

## API `/api/ub/*`

Las rutas App Router de `/api/ub/{entity}` ahora soportan **CRUD completo** usando el mapping configurado:

| Método | Ruta                               | Ejemplo payload                                         |
|--------|------------------------------------|---------------------------------------------------------|
| `GET`  | `/api/ub/tasks?expand=relations`   | —                                                       |
| `POST` | `/api/ub/tasks`                    | `{ "title": "Nueva tarea", "status": "Por hacer" }`    |
| `PATCH`| `/api/ub/projects?id=...`          | `{ "id": "...", "progress": 55 }`                     |
| `DELETE`| `/api/ub/calendar`                | `{ "id": "..." }`                                     |

Para la rama de estudios, usa el parámetro `collection`:

```http
POST /api/ub/studies?collection=courses
Body: { "title": "Curso", "status": "Activo" }

PATCH /api/ub/studies
Body: { "id": "...", "collection": "readings", "status": "En curso" }

DELETE /api/ub/studies
Body: { "id": "...", "collection": "flashcards" }
```

> Recuerda enviar `x-api-key` cuando hayas definido `UB_API_KEY`/`NEXT_PUBLIC_UB_API_KEY`.
