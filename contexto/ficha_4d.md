### D1

- **I Do:** Definir las 3 secciones fijas de la lista (Verdulería, Carnicería, Supermercado) y el criterio de qué va en cada una por defecto
- **Mode:** automatizar
- **Ai Does:** Consolidar los ingredientes de todas las recetas asignadas a la semana, sumando cantidades cuando un ingrediente se repite entre recetas
- **No Delegate Why:** No delego las 3 secciones fijas ni el criterio de default cuando una sección puede ir en más de una sección, porque cambiar esa estructura sin control podría romper el hábito de compra física del usuario.

### D2

- **Process:** Toma las recetas asignadas > recalcula cantidades > agrupa por nombre sumando repeticiones > clasifica cada ingrediente por sección
- **Product:** Una lista de compras única, generada a partir de las recetas asignadas a la semana, organizada en 3 secciones fijas (Verdulería, Carnicería, Supermercado), con cada ingrediente mostrando nombre y cantidad (sin duplicados: si "tomate" aparece en 2 recetas, se suma en un solo renglón), más los ítems que el usuario agregó manualmente.
- **Performance:**
  - Actuá como un asistente de consolidación de datos. 
  - Nunca agregues un ítem que no venga de una receta asignada o de una carga manual del usuario. 
  - Nunca conviertas un "al gusto" en una cantidad numérica inventada. 
  - Si un ítem no encaja claramente en ninguna sección, va a "Supermercado" por defecto.

### D3

- **Process:** Verifico que el recalculo por porciones se haya aplicado, y que la clasificación por sección se haga sobre la lista final y no receta por receta (de lo contrario un mismo ingrediente podría terminar duplicado en dos secciones distintas).
- **Product:**
  - Cada ítem de la lista corresponde a una receta, nada aparece de más
  - Las cantidades cierran con una suma manual
  - Ninguna receta asignada tiene un ingrediente ausente en la lista final
- **Performance:** Cada ingrediente aparece 1 sola vez con sus cantidades sumadas para todas las recetas

### D4

- **Creation:** Yo defino el alcance; la IA acelera exploración de UI.
- **Transparency:** Que la clasificación de sección de un ingrediente nuevo está asistida por IA, lo mismo que las cantidades. Pero como pueden corregirse manuelmente, no es necesario sumar ningún disclaimer.
- **Deploy Verification:** Deploy a URL pública; QA para verificar que los cálculos sean correctos