# Blockers

Ningún blocker duro de código ahora.

## Atención recurrente

| Tema | Impacto | Mitigación |
|---|---|---|
| `tsx watch` no recarga `.env.local` | Import falla con "Falta GEMINI_API_KEY" | Reiniciar `dev:server` tras editar env |
| Cuota Gemini 429 | Import falla | Esperar / nueva key AI Studio |
| Sin persistencia | demos se pierden al refresh | Avisar en demos; priorizar P0 persistencia |
| Repo sin commits | no hay historial git | Commit inicial cuando Virginia lo pida |

## Externos

- Deploy / hosting: no elegido.
- API key: responsabilidad local (nunca en chat ni commits).
