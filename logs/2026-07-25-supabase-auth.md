# 2026-07-25 — Auth Supabase + persistencia + share

## Qué se hizo

- Schema SQL (`supabase/schema.sql`): profiles, households, members, recipes, week_plans, shopping_items, RLS, trigger signup, RPC join por código.
- Cliente `@supabase/supabase-js`, `AuthView`, gate en `App.tsx`, logout real.
- Persistencia de recetas / plan / lista ligadas al hogar.
- Invite sheet: compartir código + unirse por código (sin mock Sam).
- ADR `007`, skill/dev-setup y gotcha de env.

## Próximo paso usuario

Crear proyecto Supabase, correr SQL, pegar keys en `.env.local`, desactivar confirm email en dev, probar con 2 cuentas.
