# Gotcha: Match receta por título

## Hecho

`MealSlot.recipeTitle` guarda el **string del título**. `generateShoppingItems` hace:

```ts
recipesList.find((r) => r.title === slot.recipeTitle)
```

## Riesgo

Renombrar receta → el slot queda huérfano → ingredientes desaparecen de la lista sin aviso.

## Mitigación futura

Guardar `recipeId` en el slot (pending). Mientras: al renombrar, actualizar también slots del plan.
