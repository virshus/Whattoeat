# 004 — Estado in-memory (sin persistencia)

**Fecha:** 2026-07  
**Estado:** supersedido por `007-supabase-auth-persist-share` (parcial)

## Decisión original

Estado global en React (`App.tsx`): `weekPlan`, `recipes`, `shoppingItems`, `currentView`. Seeds desde `data.ts`. **Sin localStorage / backend de datos.**

## Actualización (2026-07-25)

Con Supabase, recetas / plan / lista / hogar persisten en Postgres. React sigue siendo cache de UI. Sin sesión autenticada no hay datos de usuario.

Ver `decisions/007-supabase-auth-persist-share.md`.
