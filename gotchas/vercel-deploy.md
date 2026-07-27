# Gotcha: Deploy Vercel 404

## Síntoma

Al abrir la URL de Vercel: `404: NOT_FOUND` (Code: `NOT_FOUND`, ID tipo `gru1::...`).

## Causa

El código vive en `app/`, no en la raíz. Sin config, Vercel no encuentra `package.json`/build en la raíz y sirve un deploy vacío.

## Fix (ya en el repo)

- `vercel.json` en la raíz: `installCommand` / `buildCommand` apuntan a `app/`, `outputDirectory` = `app/dist`.
- `api/health.ts` y `api/import-recipe.ts` exponen el import en producción (misma lógica que Express local vía `app/server/handlers.ts`).
- `package.json` en la raíz solo orquesta el build.

**No hace falta** setear Root Directory en el dashboard.

## Env en Vercel

Obligatorias para que la app funcione de verdad:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (solo import)

Después de agregar o cambiar env → Redeploy.

## Nota

Hobby: timeout de serverless limitado; imports lentos (Instagram + Gemini) pueden cortarse. `maxDuration` en `vercel.json` está en 60s (sujeto al plan).

## TS5097 (imports `.ts`)

Los handlers usan imports con extensión `.ts` (tsx local). Vercel typechequea `api/` desde la raíz: hace falta `tsconfig.json` en la raíz con `allowImportingTsExtensions` + `noEmit` (igual que `app/tsconfig.json`).
