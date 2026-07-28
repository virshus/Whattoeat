# Gotcha: Otros vs Supermercado

## Spec (ficha D2)

Ítem que no encaja → **Supermercado** por defecto.

## Código (2026-07-28)

`classifyIngredient` / `resolveIngredientCategory` en `app/src/utils/ingredientCategories.ts` defaultan a **Supermercado**. Spec de términos: `contexto/ingredientes-secciones.md`.

`Otros` sigue en el tipo y en `ShoppingListView` solo como fallback si quedaran ítems viejos; la UI ya oculta secciones vacías.

## Impacto histórico

Antes: `ing.category || 'Otros'` mandaba imports sin categoría a Otros.
Ahora: sin match confiable → Supermercado.
