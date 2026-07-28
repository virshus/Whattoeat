import type { IngredientCategory } from '../types';
import { normalizeName } from './ingredientNormalize';

/**
 * Runtime taxonomy for shopping sections.
 * Spec: `contexto/ingredientes-secciones.md` — keep both in sync.
 *
 * Match rules:
 * - case / accents / singular-plural via normalizeName
 * - phrase match with word boundaries (no mid-word, e.g. sal ⧸ salmón)
 * - longest keyword wins; tie → Carnicería > Verdulería > Supermercado
 * - no confident match → Supermercado (ADR 001)
 */

const SECTION_PRIORITY: Record<'Carnicería' | 'Verdulería' | 'Supermercado', number> = {
  Carnicería: 3,
  Verdulería: 2,
  Supermercado: 1,
};

/** Longer / more specific phrases first in spirit; ranking is by normalized length. */
const CATEGORY_KEYWORDS: Record<'Carnicería' | 'Verdulería' | 'Supermercado', string[]> = {
  Carnicería: [
    'carne picada',
    'carne molida',
    'carne vacuna',
    'carne de vaca',
    'carne de cerdo',
    'carne de cordero',
    'carne de pavo',
    'asado de tira',
    'colita de cuadril',
    'pechuga de pollo',
    'muslo de pollo',
    'supremas de pollo',
    'suprema de pollo',
    'pata muslo',
    'patamuslo',
    'pollo entero',
    'costillar de cerdo',
    'chuletas de cerdo',
    'chuleta de cerdo',
    'salchicha parrillera',
    'jamon crudo',
    'jamon cocido',
    'atun fresco',
    'filet de pescado',
    'filete de pescado',
    'roast beef',
    'milanesas',
    'milanesa',
    'carne',
    'bife',
    'bifes',
    'lomo vacuno',
    'lomo',
    'asado',
    'vacio',
    'matambre',
    'peceto',
    'nalga',
    'cuadril',
    'paleta',
    'osobuco',
    'pollo',
    'cerdo',
    'bondiola',
    'costillitas',
    'panceta',
    'chorizo',
    'chorizos',
    'morcilla',
    'morcillas',
    'salchicha',
    'salchichas',
    'pescado',
    'merluza',
    'salmon',
    'trucha',
    'camaron',
    'camarones',
    'langostino',
    'langostinos',
    'cordero',
    'pavo',
    'conejo',
    'higado',
    'rinon',
    'rinones',
    'mollejas',
    'suprema',
    'supremas',
  ],
  Verdulería: [
    'cebolla de verdeo',
    'dientes de ajo',
    'diente de ajo',
    'tomate cherry',
    'tomates cherry',
    'repollitos de bruselas',
    'maiz fresco',
    'choclo desgranado fresco',
    'arvejas frescas',
    'oregano fresco',
    'papa',
    'batata',
    'boniato',
    'cebolla',
    'cebollin',
    'cebollines',
    'ciboulette',
    'ajo',
    'tomate',
    'lechuga',
    'rucula',
    'espinaca',
    'acelga',
    'zanahoria',
    'zapallo',
    'calabaza',
    'zapallito',
    'calabacin',
    'zucchini',
    'berenjena',
    'pimiento',
    'morron',
    'aji',
    'choclo',
    'brocoli',
    'coliflor',
    'repollo',
    'puerro',
    'apio',
    'remolacha',
    'rabanito',
    'nabo',
    'hongo',
    'hongos',
    'champinon',
    'champinones',
    'champignon',
    'palta',
    'aguacate',
    'limon',
    'lima',
    'naranja',
    'mandarina',
    'pomelo',
    'manzana',
    'pera',
    'banana',
    'platano',
    'frutilla',
    'fresa',
    'arandano',
    'frambuesa',
    'uva',
    'durazno',
    'ciruela',
    'kiwi',
    'anana',
    'pina',
    'melon',
    'sandia',
    'cilantro',
    'coriandro',
    'perejil',
    'albahaca',
    'menta',
    'hierbabuena',
    'romero',
    'tomillo',
    'jengibre',
    'habas',
    'chaucha',
    'vainita',
    'esparrago',
    'hinojo',
    'endivia',
    'radicheta',
    'pepino',
  ],
  Supermercado: [
    'jamon cocido envasado',
    'fiambre envasado',
    'salame envasado',
    'mortadela envasada',
    'papas fritas congeladas',
    'papas congeladas',
    'verduras congeladas',
    'medallones de pollo',
    'medallones de carne',
    'leche descremada',
    'leche entera',
    'leche deslactosada',
    'queso cremoso',
    'queso untable',
    'queso rallado',
    'queso roquefort',
    'queso azul',
    'queso de maquina',
    'queso port salut',
    'queso mozzarella',
    'queso muzzarella',
    'queso parmesano',
    'queso reggianito',
    'queso crema',
    'queso fresco',
    'queso blanco',
    'crema de leche',
    'dulce de leche',
    'pan lactal',
    'pan de campo',
    'pan arabe',
    'pan de pita',
    'harina 0000',
    'harina integral',
    'arveja en lata',
    'arvejas en conserva',
    'choclo en lata',
    'tomate en lata',
    'tomate triturado',
    'pure de tomate',
    'salsa de tomate',
    'atun en lata',
    'sardinas en lata',
    'aceite de oliva',
    'aceite de girasol',
    'salsa de soja',
    'salsa golf',
    'jugo en polvo',
    'agua mineral',
    'papel higienico',
    'yerba mate',
    'frutos secos',
    'nuez moscada',
    'leche',
    'yogur',
    'yogurt',
    'queso',
    'manteca',
    'huevo',
    'pan',
    'harina',
    'fideos',
    'pasta',
    'arroz',
    'avena',
    'quinoa',
    'polenta',
    'levadura',
    'lenteja',
    'garbanzo',
    'poroto',
    'frijol',
    'aceituna',
    'aceite',
    'vinagre',
    'sal',
    'pimienta',
    'azucar',
    'edulcorante',
    'mostaza',
    'mayonesa',
    'ketchup',
    'miel',
    'caldo',
    'comino',
    'pimenton',
    'curry',
    'laurel',
    'oregano',
    'helado',
    'galletitas',
    'cereales',
    'nuez',
    'nueces',
    'almendra',
    'maní',
    'mani',
    'chocolate',
    'te',
    'cafe',
    'yerba',
    'gaseosa',
    'jugo',
    'detergente',
    'servilletas',
    'esponja',
    'mozzarella',
    'muzzarella',
  ],
};

type RankedSection = 'Carnicería' | 'Verdulería' | 'Supermercado';

interface KeywordEntry {
  section: RankedSection;
  keywordNorm: string;
  length: number;
}

const KEYWORD_INDEX: KeywordEntry[] = (
  Object.entries(CATEGORY_KEYWORDS) as [RankedSection, string[]][]
).flatMap(([section, keywords]) =>
  keywords.map((keyword) => {
    const keywordNorm = normalizeName(keyword);
    return { section, keywordNorm, length: keywordNorm.length };
  })
);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if `keywordNorm` appears as a whole-phrase inside `ingredientNorm`. */
function phraseMatches(ingredientNorm: string, keywordNorm: string): boolean {
  if (!keywordNorm) return false;
  if (ingredientNorm === keywordNorm) return true;
  const re = new RegExp(`(?:^|\\s)${escapeRegex(keywordNorm)}(?:\\s|$)`);
  return re.test(ingredientNorm);
}

/**
 * Classify an ingredient name into a shopping section.
 * Returns one of the 3 product sections; never invents new categories.
 */
export function classifyIngredient(name: string): IngredientCategory {
  const ingredientNorm = normalizeName(name);
  if (!ingredientNorm) return 'Supermercado';

  let best: KeywordEntry | null = null;

  for (const entry of KEYWORD_INDEX) {
    if (!phraseMatches(ingredientNorm, entry.keywordNorm)) continue;
    if (
      !best ||
      entry.length > best.length ||
      (entry.length === best.length &&
        SECTION_PRIORITY[entry.section] > SECTION_PRIORITY[best.section])
    ) {
      best = entry;
    }
  }

  return best?.section ?? 'Supermercado';
}

/** Prefer an explicit real section; otherwise classify from the name. */
export function resolveIngredientCategory(
  name: string,
  existing?: IngredientCategory | null
): IngredientCategory {
  if (existing && existing !== 'Otros') return existing;
  return classifyIngredient(name);
}

/** When merging duplicates, keep the higher-priority section. */
export function preferredCategory(
  a: IngredientCategory,
  b: IngredientCategory
): IngredientCategory {
  const rank = (c: IngredientCategory) =>
    c === 'Carnicería' ? 3 : c === 'Verdulería' ? 2 : c === 'Supermercado' ? 1 : 0;
  return rank(a) >= rank(b) ? a : b;
}
