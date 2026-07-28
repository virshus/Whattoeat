# AGENTS.md — Whattoeat

> Archivo de control para agentes. Máx ~250 líneas. Memoria durable vive en carpetas, no en el chat.

## Identidad

**Whattoeat** — planificador semanal de comidas (Lun–Vie, almuerzo/cena) + lista de compras consolidada.
Marca: cálida, estilo Airbnb. Microcopy en **español rioplatense** (vos, "Armá tu semana").
Stack: React 19 + Vite 6 + Tailwind 4 + Motion | Express + Gemini (`app/server/`).
Código en `app/src/`. Specs y decisiones en `contexto/`.

## Reglas duras (invariantes)

1. **Lista de compras:** 4 secciones fijas — Verdulería, Carnicería, Pescadería, Supermercado (+ `Otros` solo fallback interno). Ver `decisions/001-shopping-sections.md`.
2. **Consolidación:** un ingrediente = un renglón; sumar cantidades numéricas compatibles; **nunca** inventar cantidad para "al gusto".
3. **Origen de ítems:** solo recetas asignadas a la semana + ítems manuales (`isCustom`). Nada más.
4. **Import de recetas:** Gemini rellena **solo** lo encontrado en la URL; campos ausentes quedan vacíos. No mock, no inventar.
5. **Design system:** tokens en `app/src/index.css` (`@theme`). Referencia visual: `contexto/design.md`. Primary implementado `#8518E9` (design doc dice `#9D00FF` — ver gotcha).
6. **Persistencia:** con sesión Supabase, recetas/plan/lista/hogar viven en Postgres (cache en React). Sin keys/sesión → Auth gate. Ver `decisions/007`.
7. **Secrets:** `GEMINI_API_KEY` y `VITE_SUPABASE_*` solo en `app/.env.local`. Nunca commitear. Reiniciar `dev` tras cambiar env.
8. **vite.config.ts:** no modificar bloque HMR/`DISABLE_HMR` (AI Studio).
9. **Semana:** 5 días × 2 slots (Almuerzo/Cena) = 10 comidas. Slots vacíos = CTA, no error.

## Reglas de oro (contexto)

1. El context window es caro y volátil. **La memoria real vive en archivos.**
2. Nunca cargar todo el historial ni todos los archivos del proyecto.
3. Cargar solo lo estrictamente necesario para la tarea actual.
4. Al cerrar sesión importante: actualizar `state/`, registrar en `decisions/`, comprimir en `logs/`.
5. Preferir **referenciar archivos** antes que copiar contenido largo al prompt.
6. Procedimientos repetitivos → `skills/`.
7. Mantener este archivo conciso; detalle va en subcarpetas.

## Orden de lectura (por tarea)

| Tarea | Leer (en orden) | Evitar |
|---|---|---|
| Cualquier sesión | Este archivo → `state/pending.md` | `node_modules/`, glob `**/*` |
| UI / componentes | `contexto/design.md` → `app/src/index.css` → componente tocado | Todo `components/` |
| Lista de compras | `decisions/001-shopping-sections.md` → `contexto/ingredientes-secciones.md` → `app/src/utils/shoppingList.ts` → `ShoppingListView.tsx` | `data.ts` completo |
| Plan semanal | `app/src/types.ts` → `WeeklyPlanView.tsx` → `App.tsx` (handlers) | — |
| Import recetas | `skills/recipe-import.md` → `app/server/importRecipe.ts` → `AddRecipeView.tsx` | Transcripts viejos |
| Dev / env | `skills/dev-setup.md` → `gotchas/env-and-gemini.md` | `.env.local` en chat |
| Deploy Vercel | `gotchas/vercel-deploy.md` → `vercel.json` → `api/` | Root Directory en dashboard |
| Nueva feature | `state/done.md` + `decisions/` relevantes | README genérico AI Studio |

## Routing de skills

| Señal del usuario | Skill |
|---|---|
| "no arranca", "api key", "gemini" | `skills/dev-setup.md` + `gotchas/env-and-gemini.md` |
| "importar receta", "instagram", "link" | `skills/recipe-import.md` |
| "lista de compras", "consolidar", "secciones" | `skills/shopping-list-sync.md` |
| "empty state", "componente nuevo", "UI" | `skills/ui-component.md` |
| "login", "registro", "supabase", "compartir cuenta" | `skills/dev-setup.md` + `decisions/007` + `gotchas/supabase-env.md` |

Skills del repo viven en `skills/`. Skills globales de Cursor (`~/.cursor/skills-cursor/`) solo si el usuario lo pide explícitamente.

## Definition of Done

- [ ] TypeScript sin errores (`npm run lint` en `app/`)
- [ ] Respeta invariantes de lista de compras e import
- [ ] UI alineada a tokens `index.css` y tono de `contexto/design.md`
- [ ] Empty states con `EmptyState` + copy de `utils/selectors.ts`
- [ ] Sin secrets en diff
- [ ] Si cambia arquitectura/decisión → `decisions/` + `state/`
- [ ] Si sesión significativa → entrada en `logs/`

## Comportamiento del agente

**Inicio de sesión:** leer solo AGENTS.md + `state/pending.md` (+ `done.md`/`blockers.md` si hace falta) + skill del routing table.
**Durante:** grep/read quirúrgico; no explorar todo el repo.
**Fin (si hubo cambios importantes):** actualizar `state/`, `decisions/` si aplica, `logs/YYYY-MM-DD-tema.md`.
**Commits/PRs:** solo si el usuario lo pide.

### Nunca cargar (ruido / caro)

- `node_modules/`, `app/package-lock.json`, `whattoeat.zip`
- `whattoeat-diagram.html`, `diagrama_flujo.html` (salvo que pidan el diagrama)
- Transcripts completos de chats viejos
- Glob `**/*` sobre todo el repo
- `app/src/data.ts` completo (salvo mocks puntuales)
- `.env.local` (secrets) en el chat

## Mapa de memoria

```
/
├── AGENTS.md          ← este archivo (entrada única)
├── contexto/          ← specs de producto y diseño
│   ├── design.md
│   ├── decisiones.md  ← índice de decisiones
│   └── ficha_4d.md    ← ficha Discovery original
├── decisions/         ← ADRs con fecha
├── state/             ← done / pending / blockers
├── skills/            ← procedimientos reutilizables
├── gotchas/           ← trampas conocidas
└── logs/              ← resúmenes de sesiones
```

## Arquitectura rápida

```
app/
├── src/
│   ├── App.tsx           # estado global, navegación, sync shopping
│   ├── types.ts          # dominio
│   ├── data.ts           # mocks (dev)
│   ├── utils/
│   │   ├── shoppingList.ts  # generate + merge + sync
│   │   └── selectors.ts     # empty-state copy, helpers
│   ├── components/       # UI (EmptyState, BottomSheet, views…)
│   └── services/importRecipe.ts  # fetch → /api/import-recipe
└── server/
    ├── index.ts          # Express :3001
    ├── loadEnv.ts        # .env.local (importar primero)
    └── importRecipe.ts   # fetch URL + Gemini JSON schema
```

Vite :3000 proxy `/api` → :3001. `npm run dev` = client + server.

## Vistas

| `currentView` | Componente principal |
|---|---|
| `home` | WeeklyHighlight, ShoppingCard, RecipeList |
| `weekly` | WeeklyPlanView |
| `recipes` | RecipesView |
| `shopping` | ShoppingListView |
| `profile` | placeholder "Próximamente" |

## Punteros críticos

- Ficha 4D (descubrimiento): `contexto/ficha_4d.md`
- Design system completo: `contexto/design.md` (stub en raíz → no duplicar)
- Taxonomía ingredientes → sección: `contexto/ingredientes-secciones.md`
- Índice decisiones: `contexto/decisiones.md`
- Estado vivo: `state/done.md`, `state/pending.md`, `state/blockers.md`

## Arranque de sesión (usuario → agente)

Frase mínima suficiente:

> Leé AGENTS.md + state/pending.md. Tarea: \<una frase\>.

Si es dominio conocido, añadir la señal del routing (`lista de compras`, `importar`, `UI`, etc.). No pegar historial ni zips.
