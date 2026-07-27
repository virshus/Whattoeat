# Skill: Dev setup

## Arranque

```bash
cd app
cp .env.example .env.local   # si no existe
# Editar GEMINI_API_KEY + VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev                  # client :3000 + server :3001
```

Verificar API import: `curl -s http://localhost:3001/api/health` → `{"ok":true,"geminiConfigured":true}`

## Supabase (auth + datos + compartir)

1. Crear proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pegar y ejecutar [`supabase/schema.sql`](../supabase/schema.sql).
3. **Auth → Providers → Email:** en desarrollo, desactivar *Confirm email* (si no, el registro pide confirmar mail y no hay sesión).
4. Project Settings → API → copiar **Project URL** y **anon public** a `app/.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. Reiniciar Vite (`npm run dev`) — las `VITE_*` se leen al arrancar.

Probar: registrar dos usuarios → Perfil → Invitar → copiar código → en la otra cuenta pestaña “Unirme”.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | client + server |
| `npm run dev:client` | solo Vite :3000 |
| `npm run dev:server` | solo Express (con `--env-file=.env.local`) |
| `npm run lint` | `tsc --noEmit` |

## Si "Falta GEMINI_API_KEY"

1. Confirmar key en `app/.env.local` (no en raíz del monorepo).
2. **Reiniciar** el server (watch no ve cambios de env).
3. Leer `gotchas/env-and-gemini.md`.

## Si la pantalla pide configurar Supabase

Faltan `VITE_SUPABASE_*` o siguen con placeholder `YOUR_`. Ver `decisions/007-supabase-auth-persist-share.md`.

## No tocar

- Bloque HMR / `DISABLE_HMR` en `vite.config.ts`.
- Commitear `.env.local`.
