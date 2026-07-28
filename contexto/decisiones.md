# Índice de decisiones — Whattoeat

Puntero central. Detalle en `decisions/` (ADR) o specs en este folder.

## Producto

| ID | Tema | Fuente | Archivo |
|---|---|---|---|
| D1 | 4 secciones fijas de compra (incl. Pescadería) | ficha 4D + update | `decisions/001-shopping-sections.md` |
| D1b | Taxonomía ingrediente → sección | producto | `contexto/ingredientes-secciones.md` + `app/src/utils/ingredientCategories.ts` |
| D2 | Consolidación sin duplicados | ficha 4D + código | `decisions/002-shopping-consolidation.md` |
| D3 | No inventar "al gusto" / datos | ficha 4D | `decisions/003-no-invented-data.md` |
| D4 | Deploy público + QA cálculos | ficha 4D | `state/pending.md` |

## Técnica

| ID | Tema | Archivo |
|---|---|---|
| T1 | Estado: React cache + Supabase persist | `decisions/007-supabase-auth-persist-share.md` (antes `004`) |
| T2 | Import real vía Gemini (no mock) | `decisions/005-recipe-import-gemini.md` |
| T3 | Match receta en plan por `title` | `gotchas/recipe-match-by-title.md` |
| T4 | Env: loadEnv + `--env-file` | `gotchas/env-and-gemini.md` |
| T5 | Auth email/password + share | `decisions/007-supabase-auth-persist-share.md` |

## Diseño

| Tema | Archivo |
|---|---|
| Design system Airbnb-style | `contexto/design.md` |
| Tokens CSS implementados | `app/src/index.css` |
| Drift tokens (primary/display) | `gotchas/design-tokens-drift.md` |
| Empty states reutilizables | `decisions/006-empty-states.md` |
| Fallback Otros vs Supermercado | `gotchas/otros-vs-supermercado.md` |

## Cómo registrar una decisión nueva

1. Crear `decisions/NNN-tema-corto.md` con: fecha, contexto, decisión, alternativas descartadas.
2. Añadir fila en esta tabla.
3. Si afecta pendientes → `state/pending.md`.
