# 001 — Secciones fijas de lista de compras

**Fecha:** 2026-07 (ficha 4D)  
**Estado:** vigente

## Decisión

La lista de compras tiene **3 secciones fijas visibles** (orden de UI):
1. Supermercado
2. Verdulería
3. Carnicería

`Otros` existe en el tipo TypeScript como **fallback interno** (ingrediente sin categoría). No es una sección de producto deliberada.

## Por qué

El usuario compra físicamente por tipo de negocio. Cambiar la estructura rompe el hábito (ficha D1: no automatizar ni delegar las 3 secciones).

## Reglas

- Clasificación por defecto / ambigua → **Supermercado** (ficha D2). Código hoy usa `Otros` si falta `category` — ver `gotchas/otros-vs-supermercado.md`.
- Design.md dice "Almacén"; producto/código usan **Supermercado**. Preferir Supermercado.

## Fuentes

`contexto/ficha_4d.md` (D1–D2) · `app/src/types.ts` · `ShoppingListView.tsx`
