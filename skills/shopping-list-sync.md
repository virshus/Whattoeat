# Skill: Shopping list sync

## Cuándo

Cambios a plan semanal, ingredientes de recetas, o ítems manuales.

## Flujo canónico

```
weekPlan + recipes → generateShoppingItems → mergeShoppingItems(existing) → setShoppingItems
```

Trigger: `useEffect` en `App.tsx` deps `[weekPlan, recipes]`.

## Reglas

1. Leer `decisions/001` + `002` + `003` + `contexto/ingredientes-secciones.md` antes de tocar lógica.
2. Preservar `isCustom` y `isChecked` en merge.
3. No inventar cantidades para "al gusto".
4. UI: 4 secciones producto (Supermercado, Verdulería, Carnicería, Pescadería); `Otros` solo fallback. Default sin match → **Supermercado**.
5. Categoría: `classifyIngredient` (`ingredientCategories.ts`); taxonomía humana en el md de contexto.

## Archivos

`contexto/ingredientes-secciones.md` · `utils/ingredientCategories.ts` · `utils/shoppingList.ts` · `ShoppingListView.tsx` · `App.tsx` (handlers add/toggle/delete)

## Test mental

- 2 recetas con "tomate 200g" → un renglón "400 g" en Verdulería
- "500 g" + "500 g" → "1 kg"; "1000 g" → "1 kg"
- "100 gr" / "100 grs" / "100 gramos" → se muestran como "100 g"
- "1 unidad" + "3 unidades" → "4 unidades"
- "Papa" + "Papas" → un renglón Verdulería
- "milanesa de pollo" → Carnicería
- "salmón" / "merluza" → Pescadería
- "atún en lata" → Supermercado
- "queso rallado light" → Supermercado
- Desconocido → Supermercado (no Otros)
- Quitar comida del plan → ítem desaparece (salvo custom)
- Checkbox + regenerar → checkbox se mantiene por nombre normalizado
- "Al gusto" nunca se convierte a número
