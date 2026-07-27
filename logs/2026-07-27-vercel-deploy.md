# 2026-07-27 — Deploy Vercel

- Causa del `404: NOT_FOUND`: app en `app/`, sin config en raíz.
- Agregado `vercel.json` (build → `app/dist`), `package.json` raíz, `api/health.ts` + `api/import-recipe.ts`.
- Handlers compartidos en `app/server/handlers.ts` (Express local + serverless).
- Docs: README deploy, `gotchas/vercel-deploy.md`, AGENTS routing, pending actualizado.
- Usuario: push + env en Vercel (`VITE_SUPABASE_*`, `GEMINI_API_KEY`) + Redeploy.
