# Whattoeat

Planificador semanal de comidas (Lun–Vie, almuerzo/cena) con lista de compras consolidada. Pensado para el día a día en casa: armás la semana, importás recetas y salís a comprar con una sola lista.

Marca cálida, estilo Airbnb. Microcopy en **español rioplatense**.

## Qué hace

- **Plan semanal** — 5 días × 2 slots (Almuerzo / Cena)
- **Recetas** — catálogo propio + import desde URL (Instagram / web) con Gemini
- **Lista de compras** — consolidada en 4 secciones fijas: Verdulería, Carnicería, Pescadería, Supermercado
- **Hogar compartido** — auth y datos en Supabase; invitá a otra persona con un código

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 6, Tailwind 4, Motion |
| Backend (import) | Express + Google Gemini |
| Auth / DB | Supabase (Postgres + Auth) |

## Requisitos

- [Node.js](https://nodejs.org/) 20+ (recomendado LTS)
- Cuenta en [Google AI Studio](https://aistudio.google.com/apikey) (key Gemini)
- Proyecto en [Supabase](https://supabase.com) (auth + persistencia)

## Quick start

```bash
git clone https://github.com/virshus/Whattoeat.git
cd Whattoeat/app
cp .env.example .env.local
```

Editá `app/.env.local` con tus keys (ver [Variables de entorno](#variables-de-entorno)).

```bash
npm install
npm run dev
```

| Servicio | URL |
|---|---|
| App (Vite) | http://localhost:3000 |
| API import | http://localhost:3001 |

Verificar la API:

```bash
curl -s http://localhost:3001/api/health
# → {"ok":true,"geminiConfigured":true}
```

Vite proxea `/api/*` → `:3001`. **Reiniciá `npm run dev` después de cambiar `.env.local`.**

### Supabase (una vez)

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → ejecutá [`supabase/schema.sql`](supabase/schema.sql).
3. **Auth → Providers → Email:** en desarrollo, desactivá *Confirm email*.
4. Project Settings → API → copiá **Project URL** y **anon public** a `app/.env.local`.
5. Reiniciá el servidor de desarrollo.

## Variables de entorno

Archivo: `app/.env.local` (nunca commitear). Plantilla: [`app/.env.example`](app/.env.example).

| Variable | Obligatoria | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | Sí (import) | Key de Google AI Studio (`AIza...`) |
| `VITE_SUPABASE_URL` | Sí (auth) | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí (auth) | Anon/public key de Supabase |
| `IMPORT_API_PORT` | No | Puerto del API de import (default `3001`) |
| `APP_URL` | No | URL pública de la app (deploy / callbacks) |

Sin `VITE_SUPABASE_*` válidas, la app muestra el gate de auth / configuración.

## Scripts

Correr desde `app/`:

| Script | Qué hace |
|---|---|
| `npm run dev` | Client (`:3000`) + server (`:3001`) |
| `npm run dev:client` | Solo Vite |
| `npm run dev:server` | Solo Express (lee `.env.local`) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run clean` | Limpia `dist` |

## Deploy en Vercel

El repo ya trae `vercel.json` en la raíz (no hace falta configurar Root Directory).

1. Importá el repo en [vercel.com](https://vercel.com) (o Redeploy si ya existe el proyecto).
2. En **Settings → Environment Variables** agregá:

| Variable | Scope |
|---|---|
| `VITE_SUPABASE_URL` | Production (y Preview si querés) |
| `VITE_SUPABASE_ANON_KEY` | Production |
| `GEMINI_API_KEY` | Production (para importar recetas) |

3. Redeploy. La app sale de `app/dist`; el import vive en `/api/*` (serverless).

Si ves `404: NOT_FOUND`, casi seguro faltaba el `vercel.json` o el deploy es anterior a estos archivos: hacé push + Redeploy.

Detalle: [`gotchas/vercel-deploy.md`](gotchas/vercel-deploy.md).

## Estructura del repo

```
whattoeat/
├── api/                 # Serverless (Vercel): health + import-recipe
├── app/                 # Código de la aplicación
│   ├── src/             # React (UI, estado, utils)
│   ├── server/          # Express local + handlers compartidos
│   └── .env.example
├── vercel.json          # Build/output + funciones API
├── supabase/            # schema.sql (Postgres + RLS)
├── contexto/            # Specs de producto y diseño
├── decisions/           # ADRs
├── skills/              # Procedimientos de desarrollo
├── gotchas/             # Trampas conocidas
├── state/               # done / pending / blockers
└── AGENTS.md            # Guía para agentes de IA
```

## Arquitectura (rápida)

```
Browser (:3000) ──► Vite ──► /api/* proxy ──► Express (:3001) ──► Gemini
                     │
                     └──► Supabase (auth, recetas, plan, lista, hogar)
```

- **Lista de compras:** solo recetas asignadas a la semana + ítems manuales. Un ingrediente = un renglón; se suman cantidades compatibles; nunca se inventa cantidad para “al gusto”.
- **Import de recetas:** Gemini completa solo lo que encuentra en la URL; campos ausentes quedan vacíos.

Detalle de dominio: [`AGENTS.md`](AGENTS.md) · diseño: [`contexto/design.md`](contexto/design.md).

## Troubleshooting

| Problema | Qué hacer |
|---|---|
| `Falta GEMINI_API_KEY` | Confirmá la key en `app/.env.local` (no en la raíz) y reiniciá el server |
| Pantalla pide configurar Supabase | Completá `VITE_SUPABASE_*` sin placeholders `YOUR_` |
| Import falla / Instagram | Scraping frágil; probá otra URL o revisá logs del server |
| Health `geminiConfigured: false` | Env no cargado; reiniciá tras editar `.env.local` |
| Vercel `404: NOT_FOUND` | Push de `vercel.json` + Redeploy; ver [`gotchas/vercel-deploy.md`](gotchas/vercel-deploy.md) |
| Import OK en local, falla en Vercel | Falta `GEMINI_API_KEY` en Environment Variables de Vercel |

Más detalle: [`skills/dev-setup.md`](skills/dev-setup.md) · [`gotchas/env-and-gemini.md`](gotchas/env-and-gemini.md).

## Documentación del proyecto

| Recurso | Para qué |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Invariantes, routing de tareas, DoD |
| [`state/pending.md`](state/pending.md) | Backlog vivo |
| [`contexto/decisiones.md`](contexto/decisiones.md) | Índice de ADRs |
| [`skills/`](skills/) | Setup, import, lista de compras, UI |

## Licencia

Proyecto privado / uso educativo. Sin licencia open source publicada por ahora.
