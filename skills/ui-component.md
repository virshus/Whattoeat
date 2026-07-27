# Skill: UI component

## Antes de codear

1. `contexto/design.md` (principios + voz)
2. `app/src/index.css` (`@theme` + clases `.section-title`, `.card`, `.page-x`…)
3. Componente vecino similar (copiar patrones, no inventar)

## Checklist

- [ ] Tokens, no hex/píxeles sueltos (`text-3xl`, `p-5` arbitrarios = mal)
- [ ] Empty → `EmptyState` + copy de `selectors.ts`
- [ ] Microcopy rioplatense (vos)
- [ ] Touch target ≥ 44px en controles clave
- [ ] Primary implementado `#8518E9` (no asumir `#9D00FF` del design doc)

## Evitar

Cargar todo `components/`. No rediseñar paleta sin decisión nueva en `decisions/`.
