# Skill: Shopping list sync

## Cuándo

Cambios a plan semanal, ingredientes de recetas, o ítems manuales.

## Flujo canónico

```
weekPlan + recipes → generateShoppingItems → mergeShoppingItems(existing) → setShoppingItems
```

Trigger: `useEffect` en `App.tsx` deps `[weekPlan, recipes]`.

## Reglas

1. Leer `decisions/001` + `002` + `003` antes de tocar lógica.
2. Preservar `isCustom` y `isChecked` en merge.
3. No inventar cantidades para "al gusto".
4. UI: 3 secciones producto; `Otros` solo fallback.

## Archivos

`utils/shoppingList.ts` · `ShoppingListView.tsx` · `App.tsx` (handlers add/toggle/delete)

## Test mental

- 2 recetas con "tomate 200g" → un renglón "400g"
- Quitar comida del plan → ítem desaparece (salvo custom)
- Checkbox + regenerar → checkbox se mantiene por nombre
