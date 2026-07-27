# Hecho

Última actualización: 2026-07-22

## Producto / UI

- [x] Shell app: home, weekly, recipes, shopping, profile (placeholder)
- [x] Plan semanal Lun–Vie × Almuerzo/Cena (10 slots)
- [x] Asignar / reemplazar / quitar comidas (selector + bottom sheets)
- [x] CRUD básico de recetas + favoritos + detalle
- [x] Lista de compras por secciones + ítems custom + checkboxes
- [x] Empty states (`EmptyState` + `selectors.ts`)
- [x] Sync lista ↔ plan/recetas (`shoppingList.ts` + effect en `App.tsx`)
- [x] UI clean: tokens tipográficos/espaciado en `index.css` (2026-07-21)

## Import

- [x] Endpoint Express `/api/import-recipe` + health
- [x] Extracción HTML + Gemini JSON schema
- [x] UI import en `AddRecipeView`
- [x] Fix carga `GEMINI_API_KEY` (`loadEnv.ts` + `--env-file`) — 2026-07-21

## Docs / memoria

- [x] `contexto/ficha_4d.md`, `contexto/design.md`, `contexto/decisiones.md`
- [x] Sistema AGENTS + decisions/state/skills/gotchas/logs (2026-07-22)
- [x] Deploy Vercel: `vercel.json` + `api/` serverless + gotcha (2026-07-27)

## Diagramas (referencia, no cargar en contexto de código)

- `whattoeat-diagram.html`, `diagrama_flujo.html`
