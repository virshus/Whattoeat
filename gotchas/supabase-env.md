# Gotcha — Supabase env y confirm email

## Env Vite

Las keys de Supabase deben ser `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `app/.env.local`.  
Variables sin prefijo `VITE_` **no** llegan al browser.

Tras cambiar `.env.local`, reiniciar `npm run dev`.

## URL base (no `/rest/v1`)

`VITE_SUPABASE_URL` es **solo** el Project URL, sin path:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
```

Si pegás `…/rest/v1` (o una comilla de más), el signUp falla con **"Invalid path specified in request URL"**. El cliente de Supabase agrega `/auth/v1` y `/rest/v1` solo.

## Confirm email

Si Auth tiene “Confirm email” activo, `signUp` crea el usuario pero **no** devuelve `session`. La app muestra un error pidiendo confirmar mail o desactivar confirmación en desarrollo.

## Schema

Sin correr `supabase/schema.sql`, el login puede funcionar pero el bootstrap falla (faltan `profiles` / trigger).

## Anon key

Usar la **anon public**, nunca la `service_role` en el cliente.
