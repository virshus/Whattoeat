# Skill: Recipe import

## Flujo

1. UI: `AddRecipeView` → `services/importRecipe.ts`
2. `POST /api/import-recipe` `{ url, source: 'instagram'|'web' }`
3. Server: `importRecipe.ts` fetch → extract → Gemini → draft
4. Usuario revisa/edita → guarda en `recipes` state

## Invariantes

- No inventar campos (decision 003/005).
- Tags solo de allowlist (`types/importRecipe.ts`).
- Key solo server-side.

## Debug rápido

```bash
curl -s http://localhost:3001/api/health
curl -s -X POST http://localhost:3001/api/import-recipe \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://...","source":"web"}'
```

## Archivos

`app/server/importRecipe.ts` · `app/server/index.ts` · `app/src/services/importRecipe.ts` · `AddRecipeView.tsx`

## Gotchas

`gotchas/env-and-gemini.md` — Instagram a menudo trae poco texto útil; web+JSON-LD mejor.
