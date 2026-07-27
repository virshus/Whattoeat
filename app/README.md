# Whattoeat — app

Código de la aplicación (React + Vite + Express).

La documentación completa del proyecto está en el [README de la raíz](../README.md).

## Arranque rápido

```bash
cp .env.example .env.local   # completar GEMINI_API_KEY + VITE_SUPABASE_*
npm install
npm run dev                  # :3000 (client) + :3001 (API)
```

| Script | Descripción |
|---|---|
| `npm run dev` | Client + server |
| `npm run lint` | Typecheck |
| `npm run build` | Build de producción |

Setup detallado (Supabase, troubleshooting): [`../skills/dev-setup.md`](../skills/dev-setup.md).
