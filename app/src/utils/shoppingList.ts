import { Recipe, WeekPlan, ShoppingItem } from '../types';

/** Strip diacritics so "Limón" / "limon" match. */
function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '');
}

/**
 * Spanish singularization for shopping-list keys.
 * "papas" → "papa", "tomates" → "tomate", "unidades" (as a word) → "unidade" then unit map handles units.
 * Consonant + "es" plurals ("limones") → drop "es" when the "ones/anes/…" pattern applies.
 */
function singularizeToken(token: string): string {
  if (token.length <= 3) return token;

  const irregular: Record<string, string> = {
    panes: 'pan',
    peces: 'pez',
    raices: 'raiz',
    lapices: 'lapiz',
  };
  if (irregular[token]) return irregular[token];

  // pez → peces already covered; -ces → -z
  if (token.endsWith('ces') && token.length > 4) {
    return `${token.slice(0, -3)}z`;
  }

  // limones, melones, jamones, panes-style: consonant stem + "es"
  if (/(?:ones|anes|enes|ores|ares|eres|ures|ales|eles|iles|oles|ules)$/.test(token)) {
    // dientes (diente+s) ends with "entes" — keep as -e noun (drop s only)
    if (/(?:entes|antes|intes|untes)$/.test(token)) {
      return token.slice(0, -1);
    }
    return token.slice(0, -2);
  }

  // Regular vowel + s (papas, cebollas, tomates, zanahorias)
  if (/[aeiou]s$/.test(token)) {
    return token.slice(0, -1);
  }

  return token;
}

/** Canonical ingredient key: "Papa" and "Papas" → same bucket. */
export function normalizeName(name: string): string {
  return stripAccents(name.toLowerCase().trim())
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeToken)
    .join(' ');
}

/**
 * Map plural/synonym units to a canonical unit for summing.
 * Display pluralization is handled separately in formatQuantity.
 */
const UNIT_CANONICAL: Record<string, string> = {
  unidad: 'unidad',
  unidades: 'unidad',
  ud: 'unidad',
  uds: 'unidad',
  u: 'unidad',
  un: 'unidad',
  g: 'g',
  gr: 'g',
  grs: 'g',
  gramo: 'g',
  gramos: 'g',
  kg: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  kilogramo: 'kg',
  kilogramos: 'kg',
  ml: 'ml',
  mililitro: 'ml',
  mililitros: 'ml',
  l: 'l',
  lt: 'l',
  lts: 'l',
  litro: 'l',
  litros: 'l',
  cda: 'cda',
  cdas: 'cda',
  cucharada: 'cda',
  cucharadas: 'cda',
  cdta: 'cdta',
  cdtas: 'cdta',
  cucharadita: 'cdta',
  cucharaditas: 'cdta',
  taza: 'taza',
  tazas: 'taza',
  atado: 'atado',
  atados: 'atado',
  diente: 'diente',
  dientes: 'diente',
  pizca: 'pizca',
  pizcas: 'pizca',
};

/** Singular / plural labels for known units when formatting the summed quantity. */
const UNIT_DISPLAY: Record<string, [string, string]> = {
  unidad: ['unidad', 'unidades'],
  atado: ['atado', 'atados'],
  diente: ['diente', 'dientes'],
  taza: ['taza', 'tazas'],
  cda: ['cda', 'cdas'],
  cdta: ['cdta', 'cdtas'],
  pizca: ['pizca', 'pizcas'],
  g: ['g', 'g'],
  kg: ['kg', 'kg'],
  ml: ['ml', 'ml'],
  l: ['l', 'l'],
};

export function normalizeUnit(unit: string): string {
  const cleaned = stripAccents(unit.toLowerCase().trim()).replace(/\.+$/, '');
  if (!cleaned) return '';
  return UNIT_CANONICAL[cleaned] ?? cleaned;
}

export function parseQuantity(
  quantity: string
): { amount: number; unit: string } | null {
  const trimmed = quantity.trim();
  if (!trimmed) return null;
  // Never invent amounts for "al gusto" / free-text
  if (/al\s*gusto/i.test(trimmed)) return null;

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;

  const amount = parseFloat(match[1].replace(',', '.'));
  if (Number.isNaN(amount)) return null;

  return {
    amount,
    unit: normalizeUnit(match[2] || ''),
  };
}

export function formatQuantity(amount: number, canonicalUnit: string): string {
  const rounded =
    Math.abs(amount - Math.round(amount)) < 1e-9
      ? String(Math.round(amount))
      : String(parseFloat(amount.toFixed(2)));

  if (!canonicalUnit) return rounded;

  const pair = UNIT_DISPLAY[canonicalUnit];
  const label = pair ? (amount === 1 ? pair[0] : pair[1]) : canonicalUnit;
  return `${rounded} ${label}`.trim();
}

function newItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;
}

function preferDisplayName(current: string, incoming: string): string {
  // Prefer singular-looking label when lengths differ (Papa over Papas).
  const curKey = normalizeName(current);
  const incKey = normalizeName(incoming);
  if (curKey !== incKey) return current;
  return incoming.length < current.length ? incoming : current;
}

export function generateShoppingItems(plan: WeekPlan, recipesList: Recipe[]): ShoppingItem[] {
  const items: Record<string, ShoppingItem> = {};

  plan.days.forEach((day) => {
    day.slots.forEach((slot) => {
      if (slot.recipeTitle) {
        const recipe = recipesList.find((r) => r.title === slot.recipeTitle);
        if (recipe?.ingredients) {
          recipe.ingredients.forEach((ing) => {
            const key = normalizeName(ing.name);
            if (!key) return;

            if (items[key]) {
              const existing = items[key];
              existing.name = preferDisplayName(existing.name, ing.name);

              const parsedExisting = parseQuantity(existing.quantity);
              const parsedIncoming = parseQuantity(ing.quantity);

              if (
                parsedExisting &&
                parsedIncoming &&
                parsedExisting.unit === parsedIncoming.unit
              ) {
                const sum = parsedExisting.amount + parsedIncoming.amount;
                existing.quantity = formatQuantity(sum, parsedExisting.unit);
              } else if (
                ing.quantity.trim() &&
                !existing.quantity.includes(ing.quantity.trim())
              ) {
                // Incompatible units / "al gusto" — concatenate, never invent
                existing.quantity += ` + ${ing.quantity.trim()}`;
              }
            } else {
              const parsed = parseQuantity(ing.quantity);
              items[key] = {
                id: newItemId(),
                name: ing.name,
                quantity: parsed
                  ? formatQuantity(parsed.amount, parsed.unit)
                  : ing.quantity,
                category: ing.category || 'Otros',
                isChecked: false,
              };
            }
          });
        }
      }
    });
  });

  return Object.values(items);
}

export function mergeShoppingItems(
  generatedItems: ShoppingItem[],
  existingItems: ShoppingItem[]
): ShoppingItem[] {
  const customItems = existingItems.filter((item) => item.isCustom);
  const checkedByName = new Map(
    existingItems
      .filter((item) => !item.isCustom)
      .map((item) => [normalizeName(item.name), item.isChecked])
  );

  const mergedGenerated = generatedItems.map((item) => ({
    ...item,
    isChecked: checkedByName.get(normalizeName(item.name)) ?? false,
  }));

  return [...mergedGenerated, ...customItems];
}

export function syncShoppingItems(
  plan: WeekPlan,
  recipesList: Recipe[],
  existingItems: ShoppingItem[]
): ShoppingItem[] {
  return mergeShoppingItems(generateShoppingItems(plan, recipesList), existingItems);
}
