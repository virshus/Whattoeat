# 005 — Import de recetas vía Gemini

**Fecha:** 2026-07  
**Estado:** vigente

## Decisión

- Cliente: `services/importRecipe.ts` → `POST /api/import-recipe` (proxy Vite → Express :3001).
- Server: fetch HTML → extract OG/JSON-LD/texto → Gemini con JSON schema → `RecipeImportDraft`.
- Fuentes: `instagram` | `web`.
- Key: `GEMINI_API_KEY` en `app/.env.local` (nunca en repo).

## Invariante

Solo datos encontrados. Campos faltantes vacíos. Ver `003-no-invented-data.md`.

## Dev

`npm run dev` = client + server. Tras editar `.env.local` → **reiniciar** `dev:server` (`tsx watch` no recarga env). Ver `gotchas/env-and-gemini.md`.
