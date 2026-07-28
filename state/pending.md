# Pendiente

Prioridad aproximada (arriba = más urgente).

## P0 — Producto core

1. **Setup Supabase en tu proyecto** — crear proyecto, correr `supabase/schema.sql`, keys en `.env.local` (`decisions/007`).
2. **Alinear fallback de categoría** — ~~código default `Otros`~~ alineado a Supermercado vía `classifyIngredient` (2026-07-28); revisar si aún hace falta sección `Otros` en UI.
3. **Match receta por `id`** — hoy el plan guarda `recipeTitle`; renombrar rompe lista (`gotchas/recipe-match-by-title.md`).
4. **QA consolidación** — sumas, "al gusto", mismo ítem en 2 secciones, porciones (ficha D3–D4).
5. **QA auth + share** — dos cuentas reales, invite code, remove member, persistencia al recargar.

## P1 — Import / datos

6. Robustez Instagram (scraping frágil / bloqueos).
7. Escala por `servings` al generar lista (design menciona ajuste por porciones; parcial o ausente).
8. Reset password / confirm email productizado.

## P2 — UI / producto

9. Unificar primary: design `#9D00FF` vs CSS `#8518E9` (`gotchas/design-tokens-drift.md`).
10. Display tipográfico: design 32px vs CSS 24px post-UI-clean — decidir canon.
11. Invitar por email real (hoy stub en Invite sheet).

## P3 — Ops

12. **Redeploy Vercel** tras push de `vercel.json`/`api/` + setear env (`VITE_SUPABASE_*`, `GEMINI_API_KEY`) y QA cálculos (ficha D4). Config de build ya está en el repo (`gotchas/vercel-deploy.md`).
13. ~~Primer commit git~~ — hecho: https://github.com/virshus/Whattoeat
14. Limpiar raíz: `whattoeat.zip`, diagramas HTML si ya no se usan.
