# Design System — Whattoeat
### Planificador semanal de comidas + lista de compras

> **Canon:** este archivo. Stub en raíz: `design.md` → apunta acá.
> **Implementación:** tokens en `app/src/index.css`. Desvíos conocidos en `gotchas/design-tokens-drift.md`.

Estilo de referencia: **Airbnb** — cálido, confiable, con foco en contenido real (recetas, comida) por sobre la decoración de UI. La marca no compite con la comida: la enmarca.

---

## 1. Principios de diseño

- **La comida es la protagonista.** Fotos grandes, generosas, sin recortes forzados. La UI se corre para dejar respirar el contenido.
- **Calidez sin infantilismo.** Bordes redondeados y color vivo, pero con jerarquía tipográfica seria — esto resuelve un problema real (falta de tiempo), no es un juguete.
- **Confianza en cada micro-decisión.** Como Airbnb con "vas a viajar a lo desconocido", acá el usuario delega "qué comer" — cada pantalla debe sentirse resuelta, nunca ambigua.
- **Aire como lujo.** El espacio en blanco comunica que planificar la semana no es una tarea pesada.

---

## 2. Paleta de color

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#9D00FF` | Violeta eléctrico — CTA principales, estados activos, acento de marca |
| `--color-primary-dark` | `#7A00C7` | Hover/pressed sobre primary |
| `--color-ink` | `#222222` | Texto principal, alto contraste |
| `--color-ink-soft` | `#6B6B6B` | Texto secundario, metadata (tiempo de prep, tags) |
| `--color-surface` | `#FFFFFF` | Fondo de cards y contenido |
| `--color-canvas` | `#F7F7F5` | Fondo general de la app (cálido, no blanco puro) |
| `--color-border` | `#E8E6E1` | Divisores, bordes de card sutiles |
| `--color-success` | `#00A699` | Verde-agua Airbnb — confirmaciones, "comprado", balance nutricional ok |
| `--color-warning` | `#FFB400` | Alertas suaves — ej. "falta proteína esta semana" |

No se usa negro puro ni blanco puro: todo tiene una temperatura cálida, consistente con la naturaleza doméstica del producto.

---

## 3. Tipografía

- **Display / Headings:** `Cereal` (o fallback `Circular Std` / `Poppins SemiBold`) — geométrica, redondeada, amigable pero con peso editorial.
- **Body:** `Inter` — alta legibilidad en listas largas (ingredientes, pasos de receta).
- **Utility / Data:** `Inter Medium`, tracking +0.02em — para tags, badges de tiempo, cantidades.

**Escala tipográfica:**

| Rol | Tamaño | Peso | Uso |
|---|---|---|---|
| Display | 32px / 40px lh | 700 | Título de sección ("Tu semana") |
| H1 | 24px / 32px lh | 600 | Nombre de receta en detalle |
| H2 | 18px / 24px lh | 600 | Nombre de receta en card |
| Body | 16px / 24px lh | 400 | Instrucciones, descripciones |
| Small | 14px / 20px lh | 500 | Metadata (tiempo, porciones) |
| Caption | 12px / 16px lh | 500 | Tags, labels de sección en lista de compras |

---

## 4. Layout y espaciado

Grid de 8px como unidad base.

- Padding de card: `16px` (mobile) / `24px` (desktop)
- Gap entre cards: `12px`
- Radio de borde: `12px` en cards, `24px` en botones primarios (pill-shape, firma visual de Airbnb), `8px` en inputs
- Sombra de card: `0 2px 8px rgba(0,0,0,0.08)` — sutil, elevación de "foto sobre mesa", no dramática

**Vista semanal (lunes a viernes):** grid horizontal scrolleable en mobile, 5 columnas fijas en desktop. Cada día es una columna con slots apilados (almuerzo / cena), no una lista — el usuario debe *ver* la semana completa de un vistazo, tal como lo hacía en su planner de papel.

---

## 5. Componentes clave

**Recipe Card**
Foto 4:5 (formato retrato, como feed de Instagram — coherente con que muchas recetas se importan de ahí) + overlay inferior con nombre, tiempo de prep (ícono reloj) y tag principal. Al tocar, expande a detalle sin perder contexto (transición tipo modal, no navegación completa).

**Day Slot**
Contenedor vacío = invitación a la acción ("Agregá una receta"), nunca un espacio muerto. Con receta asignada = mini recipe card con opción rápida de quitar/reemplazar.

**Shopping List Item**
Checkbox circular grande (fácil de tocar con el súper en la mano) + nombre + cantidad ajustada por porciones. Al tachar: strikethrough + opacidad 40%, permanece visible (no desaparece) para dar sensación de progreso.

**Section Header (lista de compras)**
Verdulería / Carnicería / Pescadería / Almacén — label en caption, con un ícono simple de línea, separador sutil, no caja pesada.

**Botón primario**
Pill-shape, `--color-primary` (violeta), texto blanco, 48px alto mínimo (target táctil). Verbo de acción siempre explícito: "Agregar a la semana", nunca "Confirmar".

---

## 6. Voz y tono (microcopy)

- Activa, directa, sin tecnicismos: "Armá tu semana", no "Configurar planificación".
- Sin culpa ni tono clínico en sugerencias nutricionales: "Esta semana viene liviana en proteína" en vez de "Déficit proteico detectado".
- Estados vacíos como invitación, no como error: "Tu semana está libre. ¿Qué comemos?"
- Confirmaciones consistentes con el verbo de la acción: el botón dice "Agregar a la lista" → el toast dice "Agregado a la lista".

---

## 7. Elemento de firma (signature)

**La vista semanal como "mesa servida":** en vez de un calendario tradicional con celdas grises, cada día se representa como un pequeño "plato" visual (card redondeada con la foto de la comida asignada). Una semana completa y planificada se *ve* como una mesa puesta — el objetivo emocional del producto (tranquilidad, resolución) traducido directamente en la interfaz principal.

---

## 8. Accesibilidad y calidad mínima

- Contraste mínimo AA en todo texto sobre `--color-canvas` y `--color-surface`
- Focus visible en todos los elementos interactivos (outline `--color-primary` violeta, 2px)
- Touch targets mínimo 44×44px (checkboxes de lista de compras, botones de día)
- Reduced motion respetado en transiciones de card a detalle
