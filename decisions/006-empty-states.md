# 006 — Empty states reutilizables

**Fecha:** 2026-07-21  
**Estado:** vigente

## Decisión

Componente único `EmptyState` + copy centralizado en `utils/selectors.ts`.

## Escenarios

| Caso | Helper copy | CTA típico |
|---|---|---|
| Sin recetas | `getEmptyRecipesCopy` | Agregar receta |
| Semana vacía (con/sin recetas) | `getEmptyWeekCopy(hasRecipes)` | Agregar / Armá tu semana |
| Lista vacía | `getEmptyShoppingCopy` | Ir al menú semanal |
| Todo comprado | `getShoppingAllDoneCopy` | — |

## Tono

Invitación, no error. Español rioplatense. Alineado a `contexto/design.md` §6.

## Dev tip

En `App.tsx`: comentar mocks y usar `emptyWeekPlan` / `emptyRecipes` de `data.ts` para probar.
