# 2026-07-22 — Sistema de memoria persistente

## Qué

Se creó / completó la estructura AGENTS + decisions/state/skills/gotchas/logs.
Se restauró `contexto/design.md` (había quedado stub en raíz sin canon).

## Hallazgos de contexto

- AGENTS.md apuntaba a carpetas que **no existían** → agentes "leían" paths rotos.
- Info crítica se perdía entre chats: fix Gemini, empty states, UI-clean, drift de tokens.
- Ineficiencia: zip + diagramas HTML en raíz; riesgo de cargar `data.ts` / todo `components/`.

## Estado producto (snapshot)

Core UI + shopping sync + import Gemini funcionando in-memory. Pendiente: persistencia, deploy, match por id, alinear fallback categoría.

## Archivos clave nuevos

Ver `AGENTS.md` mapa de memoria. Índice: `contexto/decisiones.md`.
