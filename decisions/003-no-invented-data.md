# 003 — No inventar datos

**Fecha:** 2026-07  
**Estado:** vigente

## Decisión

1. **"Al gusto" / sin cantidad:** nunca convertir a número inventado. Dejar el texto tal cual.
2. **Import de recetas (Gemini):** solo campos presentes en la URL/página. Ausentes = vacíos. Sin mocks.
3. **Lista de compras:** no agregar ítems que no vengan de receta asignada o carga manual.

## Por qué

Confianza del usuario: la app consolida, no inventa. Errores de cantidad invalidan el producto (ficha D3).

## Fuentes

`contexto/ficha_4d.md` · `app/server/importRecipe.ts` · `skills/recipe-import.md`
