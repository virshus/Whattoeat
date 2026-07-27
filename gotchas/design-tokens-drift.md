# Gotcha: Drift design tokens

## Primary

| Fuente | Valor |
|---|---|
| `contexto/design.md` | `#9D00FF` / dark `#7A00C7` |
| `app/src/index.css` (real) | `#8518E9` / dark `#6B08C7` |

**Usar el CSS** al implementar. Unificar valores = decisión explícita (pending).

## Tipografía Display

| Fuente | Valor |
|---|---|
| design.md | 32px / 700 |
| index.css post UI-clean | 24px (`--text-display`) / section titles 18px |

La implementación priorizó densidad "Airbnb clean". No revertir a 32px sin pedido.

## Naming sección compras

design.md dice "Almacén"; producto/código: **Supermercado**.
