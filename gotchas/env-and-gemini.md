# Gotcha: Env + Gemini

## Síntoma

`"Falta GEMINI_API_KEY"` aunque la key está en `.env.local`.

## Causa

1. Server arrancó **antes** de crear/editar `.env.local`.
2. `tsx watch` **no** recarga archivos env.

## Fix

```bash
# matar proceso en :3001 y:
cd app && npm run dev:server
# o npm run dev
curl -s http://localhost:3001/api/health   # geminiConfigured: true
```

## Setup correcto

- Archivo: `app/.env.local` (junto a `package.json` de `app/`)
- Carga: `server/loadEnv.ts` (import primero) + `node --env-file=.env.local` en script
- Nunca pegar la key en el chat ni commitearla

## Otros errores Gemini

| Código | Mensaje típico |
|---|---|
| 401/403 | Key inválida → regenerar en aistudio.google.com/apikey |
| 429 | Cuota → esperar o nueva key |
