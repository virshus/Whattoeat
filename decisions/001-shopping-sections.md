# 001 — Secciones fijas de lista de compras

**Fecha:** 2026-07 (ficha 4D)  
**Actualizado:** 2026-07-28 (Pescadería separada)  
**Estado:** vigente

## Decisión

La lista de compras tiene **4 secciones fijas visibles** (orden de UI):
1. Supermercado
2. Verdulería
3. Carnicería
4. Pescadería

`Otros` existe en el tipo TypeScript como **fallback interno** (ítems legacy). No es una sección de producto deliberada.

## Por qué

El usuario compra físicamente por tipo de negocio. Carnicería y pescadería son locales distintos en el hábito rioplatense; mezclar pescados con carnes rompe ese recorrido.

La ficha 4D original hablaba de 3 secciones; producto evolucionó a 4 al separar pescados/mariscos.

## Reglas

- Clasificación por defecto / ambigua → **Supermercado** (ficha D2).
- Taxonomía y matching: `contexto/ingredientes-secciones.md` + `ingredientCategories.ts`.
- Empate de match: Carnicería > Pescadería > Verdulería > Supermercado.
- Design.md dice "Almacén"; producto/código usan **Supermercado**. Preferir Supermercado.

## Fuentes

`contexto/ficha_4d.md` (D1–D2) · `contexto/ingredientes-secciones.md` · `app/src/types.ts` · `app/src/utils/ingredientCategories.ts` · `ShoppingListView.tsx`
