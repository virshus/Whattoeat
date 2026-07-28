# Clasificación de ingredientes por sección de compra

Referencia de producto para clasificar cada ingrediente en la lista de compras de Whattoeat.

**Runtime:** `app/src/utils/ingredientCategories.ts` (mantener alineado con este archivo).  
**Secciones:** `decisions/001-shopping-sections.md`.

## Reglas generales de matching

- **Ignorar mayúsculas/minúsculas** al comparar (ej. `Papa` = `papa` = `PAPA`).
- **Singular y plural = mismo ingrediente**: si el listado dice `Papa`, también debe reconocerse `Papas`. Aplica a **todos** los ingredientes de este documento.
- **Ignorar cantidad/unidad al matchear**: `2 papas`, `500g de papa`, `papa (al gusto)` matchean contra `papa`.
- **Coincidencia parcial válida** con límites de palabra: si el nombre contiene el término base como palabra/frase, matchea (ej. `papa noisette`, `papa pay` → Verdulería; `queso rallado light` → Supermercado). No matchear en el medio de otra palabra (`sal` no captura `salmón`).
- **Si hay más de un match**, gana el **término más largo**; ante empate de largo: **Carnicería > Pescadería > Verdulería > Supermercado** (ej. `milanesa de pollo` → Carnicería).
- **Default sin match confiable → Supermercado** (ficha D2 / ADR 001). `Otros` es solo fallback interno de tipo/UI, no una sección de producto nueva. Nunca inventar categorías.

---

## Verdulería (frutas y verduras frescas)

- Papa / Papas
- Batata / Batatas / Boniato / Boniatos
- Cebolla / Cebollas (blanca, morada, de verdeo)
- Cebolla de verdeo / Cebollín / Cebollines / Ciboulette
- Ajo / Ajos / Diente de ajo / Dientes de ajo
- Tomate / Tomates (perita, cherry, redondo)
- Tomate cherry / Tomates cherry
- Lechuga / Lechugas (criolla, mantecosa, romana, morada)
- Rúcula
- Espinaca / Espinacas
- Acelga / Acelgas
- Zanahoria / Zanahorias
- Zapallo / Zapallos (calabaza)
- Zapallito / Zapallitos (de tronco/redondo)
- Calabacín / Calabacines / Zucchini
- Berenjena / Berenjenas
- Pimiento / Pimientos / Morrón / Morrones (rojo, verde, amarillo)
- Ají / Ajíes
- Choclo / Choclos / Maíz fresco
- Choclo desgranado fresco
- Brócoli / Brócolis
- Coliflor / Coliflores
- Repollo / Repollos (blanco, colorado)
- Repollitos de Bruselas
- Puerro / Puerros
- Apio
- Remolacha / Remolachas
- Rabanito / Rabanitos
- Nabo / Nabos
- Hongo / Hongos / Champiñón / Champiñones / Champignon
- Palta / Paltas / Aguacate / Aguacates
- Limón / Limones
- Lima / Limas
- Naranja / Naranjas
- Mandarina / Mandarinas
- Pomelo / Pomelos
- Manzana / Manzanas
- Pera / Peras
- Banana / Bananas / Plátano / Plátanos
- Frutilla / Frutillas / Fresa / Fresas
- Arándano / Arándanos
- Frambuesa / Frambuesas
- Uva / Uvas *(frescas; pasas de uva → Supermercado)*
- Durazno / Duraznos
- Ciruela / Ciruelas
- Kiwi / Kiwis
- Ananá / Ananás / Piña / Piñas
- Melón / Melones
- Sandía / Sandías
- Cilantro / Coriandro
- Perejil
- Albahaca
- Menta / Hierbabuena
- Romero
- Tomillo
- Orégano fresco
- Jengibre
- Habas
- Arvejas frescas
- Chaucha / Chauchas / Vainita / Vainitas
- Espárrago / Espárragos
- Hinojo / Hinojos
- Endivia / Endivias
- Radicheta
- Pepino / Pepinos

---

## Carnicería (carnes, aves, embutidos frescos)

- Carne picada / Carne molida
- Carne vacuna / Carne de vaca
- Carne (nombre genérico en contexto de carnicería; preferir frases más específicas si existen)
- Bife / Bifes (de chorizo, de costilla, angosto, ancho)
- Lomo / Lomo vacuno
- Asado / Asado de tira
- Vacío
- Matambre
- Peceto / Nalga / Cuadril / Paleta / Roast beef
- Osobuco
- Colita de cuadril
- Pollo
- Pechuga de pollo / Pechugas de pollo
- Muslo de pollo / Muslos de pollo
- Suprema / Supremas de pollo
- Pata muslo / Patamuslo
- Pollo entero
- Milanesa / Milanesas (de carne, de pollo, de peceto)
- Cerdo / Carne de cerdo
- Bondiola
- Costillar de cerdo / Costillitas
- Chuleta / Chuletas de cerdo
- Chorizo / Chorizos *(fresco para asado; queda en Carnicería)*
- Morcilla / Morcillas
- Salchicha / Salchichas
- Salchicha parrillera
- Cordero / Carne de cordero
- Pavo / Carne de pavo
- Conejo
- Hígado
- Riñón / Riñones
- Mollejas

---

## Pescadería (pescados y mariscos frescos)

- Pescado (nombre genérico)
- Merluza
- Salmón
- Atún fresco (si es en lata → Supermercado)
- Trucha
- Filet de pescado / Filete de pescado
- Camarón / Camarones / Langostino / Langostinos
- Caballa
- Calamar / Calamares
- Pulpo
- Mejillones
- Berberechos
- Bacalao
- Corvina
- Pejerrey

---

## Supermercado (almacén, lácteos, secos, enlatados, congelados, limpieza)

### Lácteos y derivados

- Leche
- Leche descremada / entera / deslactosada
- Yogur / Yogurt (natural, saborizado, griego)
- Queso / Quesos
- Queso cremoso
- Queso untable
- Queso rallado
- Queso roquefort
- Queso azul
- Queso de máquina
- Queso port salut
- Queso mozzarella / Muzzarella / Mozzarella
- Queso parmesano / Queso reggianito
- Queso crema
- Queso fresco / Queso blanco
- Manteca
- Crema de leche
- Dulce de leche
- Huevo / Huevos

### Panificados y harinas

- Pan / Pan lactal / Pan de campo / Pan árabe / Pan de pita
- Harina / Harina 0000 / Harina integral
- Fideos / Pasta
- Arroz
- Avena
- Quinoa
- Polenta
- Levadura

### Legumbres y conservas

- Lenteja / Lentejas
- Garbanzo / Garbanzos
- Poroto / Porotos / Frijol / Frijoles
- Arveja en lata / Arvejas en conserva
- Choclo en lata
- Tomate en lata / Tomate triturado / Puré de tomate / Salsa de tomate
- Atún en lata
- Sardinas en lata
- Aceituna / Aceitunas

### Condimentos, aceites y salsas

- Aceite / Aceite de oliva / Aceite de girasol
- Vinagre
- Sal
- Pimienta
- Azúcar
- Edulcorante
- Mostaza
- Mayonesa
- Ketchup
- Salsa de soja
- Salsa golf
- Miel
- Caldo
- Comino / Pimentón / Curry / Nuez moscada / Laurel / Orégano (seco)

### Congelados

- Verduras congeladas
- Papas congeladas / Papas fritas congeladas
- Medallones de pollo / Medallones de carne
- Helado

### Snacks, dulces y bebidas

- Galletitas
- Cereales
- Frutos secos / Nuez / Nueces / Almendra / Almendras / Maní
- Pasas de uva / Pasas / Pasa de uva
- Chocolate
- Té / Café / Yerba / Yerba mate
- Agua mineral
- Gaseosa
- Jugo / Jugo en polvo

### Fiambrería / fiambres

- Jamón / Jamón cocido / Jamón crudo
- Mortadela
- Panceta
- Salame / Salami
- Fiambre / Fiambres
- Jamón cocido envasado / Fiambre envasado
- Salame envasado
- Mortadela envasada

### Limpieza y hogar (ítems manuales frecuentes)

- Papel higiénico
- Servilletas
- Detergente
- Esponja

---

## Notas de mantenimiento

1. Si un ítem cae en el default (Supermercado) y el usuario lo reubica mentalmente a otra sección, **agregar el término acá y en** `ingredientCategories.ts`.
2. Limpieza/hogar no son comida, pero pueden aparecer como ítems manuales.
3. Al cambiar reglas de matching o el default, actualizar también ADR `decisions/001-shopping-sections.md` y `gotchas/otros-vs-supermercado.md`.
