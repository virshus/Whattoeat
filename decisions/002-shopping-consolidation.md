# 002 — Consolidación de ingredientes

**Fecha:** 2026-07  
**Estado:** vigente  
**Actualizado:** 2026-07-28 (plurales)

## Decisión

Un ingrediente = un renglón. Si aparece en N recetas de la semana, se **suma** en un solo ítem.

## Algoritmo (`utils/shoppingList.ts`)

1. Recorrer slots del `WeekPlan` con `recipeTitle`.
2. Match receta por **título exacto** (gotcha).
3. Key = nombre normalizado: minúsculas, sin acentos, **singularizado** (`Papa`/`Papas` → misma key).
4. Cantidades: parsear `número + unidad`; unidades se normalizan a una forma canónica de **display**:
   - `g` / `gr` / `grs` / `gr.` / `gramo(s)` → **`g`** (siempre se muestra `g` en la lista)
   - `kg` / `kilo(s)` → `kg`
   - `ml` / `mililitro(s)` → `ml`; `l` / `lt` / `litro(s)` → `l`
   - `unidad` / `unidades` / `un.` → `unidad`
5. Si ambas son numéricas y unidades compatibles → sumar (`g`+`kg`, `ml`+`l`) y formatear (1000 g → 1 kg; 1 → singular, ≠1 → plural).
6. Si no son sumables (p. ej. "al gusto") → concatenar `"a + b"` (sin inventar conversiones entre unidades no compatibles).
7. `mergeShoppingItems`: preserva `isCustom` y checkboxes de ítems generados previos (match por key normalizada).
8. Sync en `App.tsx` vía `useEffect` cuando cambian `weekPlan` o `recipes`.

## Origen permitido

Solo: ingredientes de recetas **asignadas** + ítems manuales (`isCustom: true`). Nunca inventar ítems.

## Fuentes

`contexto/ficha_4d.md` (D2–D3) · `app/src/utils/shoppingList.ts`
