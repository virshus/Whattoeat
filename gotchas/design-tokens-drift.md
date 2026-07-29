# Gotcha: Drift design tokens

## Primary

| Fuente | Valor |
|---|---|
| `contexto/design.md` (marca) | `#9D00FF` / dark `#7A00C7` |
| `app/src/index.css` (real) | `#8518E9` / dark `#6B08C7` |

**Usar el CSS** al implementar. Unificar valores = decisión explícita (pending).

## Tipografía (canon actualizado 2026-07-28)

| Regla | Valor |
|---|---|
| Familia | **Inter** en toda la app (`--font-display` = `--font-body`) |
| Header / `.page-title` | 18px (`--text-h2`) |
| Secciones / `.section-title` | 16px (`--text-body`) |
| Display implementado | 24px (no 32px del draft viejo) |

No reintroducir Poppins. No subir section titles a 18px sin pedido.

## Espaciado / sombra (canon 2026-07-28)

- `--space-section`: **28px** (home)
- `--gap-cards`: **12px**
- Sombras suaves: ver §4.1 en `contexto/design.md`

## Naming sección compras

design.md dice Supermercado (antes "Almacén" en drafts viejos); producto/código: **Supermercado**.
