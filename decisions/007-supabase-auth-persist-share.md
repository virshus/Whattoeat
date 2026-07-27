# 007 — Auth + persistencia + compartir con Supabase

**Fecha:** 2026-07-25  
**Estado:** vigente  
**Supera en parte:** `004-in-memory-state` (datos de menú pasan a Postgres; UI sigue con cache en React)

## Contexto

Se necesita registro/login con email y contraseña, persistir recetas/plan/lista, y compartir real entre cuentas.

## Decisión

Usar **Supabase Auth + Postgres + RLS**.

- Bootstrap al registrarse (trigger): `profiles` + hogar personal + `week_plans` vacío.
- Datos viven en el **hogar** (`households` / `household_members`).
- Join por `invite_code` vía RPC `join_household_by_code` (un membership activo).
- Express sigue solo para import Gemini.

## Setup

1. Crear proyecto en supabase.com  
2. SQL Editor → pegar `supabase/schema.sql`  
3. Auth → Providers → Email: en desarrollo, desactivar **Confirm email**  
4. `app/.env.local`: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`  
5. Reiniciar `npm run dev`

## Alternativas descartadas

- Firebase (NoSQL menos cómodo para hogar multi-miembro)
- Express custom JWT (más superficie de seguridad y tiempo)
- Solo localStorage (no permite compartir real)
