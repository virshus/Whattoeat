# 002 — Consolidación de ingredientes

**Fecha:** 2026-07  
**Estado:** vigente

## Decisión

Un ingrediente = un renglón. Si aparece en N recetas de la semana, se **suma** en un solo ítem.

## Algoritmo (`utils/shoppingList.ts`)

1. Recorrer slots del `WeekPlan` con `recipeTitle`.
2. Match receta por **título exacto** (gotcha).
3. Key = `name.toLowerCase().trim()`.
4. Si ambas cantidades son `número + unidad` y unidad idéntica → sumar números.
5. Si no son sumables → concatenar `"a + b"` (sin inventar conversiones).
6. `mergeShoppingItems`: preserva `isCustom` y checkboxes de ítems generados previos.
7. Sync en `App.tsx` vía `useEffect` cuando cambian `weekPlan` o `recipes`.

## Origen permitido

Solo: ingredientes de recetas **asignadas** + ítems manuales (`isCustom: true`). Nunca inventar ítems.

## Fuentes

`contexto/ficha_4d.md` (D2–D3) · `app/src/utils/shoppingList.ts`
