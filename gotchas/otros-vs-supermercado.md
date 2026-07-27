# Gotcha: Otros vs Supermercado

## Spec (ficha D2)

Ítem que no encaja → **Supermercado** por defecto.

## Código actual

```ts
category: ing.category || 'Otros'
```

`ShoppingListView` renderiza también la sección `Otros`.

## Impacto

Ingredientes importados sin categoría caen en `Otros`, no en Supermercado. Divergencia producto/código.

## Al tocar

Preferir alinear a ficha (default Supermercado) + ocultar `Otros` si vacío, salvo que se decida lo contrario en un ADR nuevo.
