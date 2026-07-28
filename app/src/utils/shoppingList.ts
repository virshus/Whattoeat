import { Recipe, WeekPlan, ShoppingItem } from '../types';
import { preferredCategory, resolveIngredientCategory } from './ingredientCategories';
import { normalizeName, stripAccents } from './ingredientNormalize';

export { normalizeName } from './ingredientNormalize';

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
  // Gramos: cualquier alias se canoniciza a `g` y así se muestra en la lista.
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
  // Mililitros / litros
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

type QuantityFamily = 'mass' | 'volume' | 'discrete';

/** Convertible units → base (g / ml). Discrete units only sum with the same label. */
const UNIT_BASE: Record<string, { family: QuantityFamily; factor: number }> = {
  g: { family: 'mass', factor: 1 },
  kg: { family: 'mass', factor: 1000 },
  ml: { family: 'volume', factor: 1 },
  l: { family: 'volume', factor: 1000 },
};

function formatNumber(amount: number): string {
  if (Math.abs(amount - Math.round(amount)) < 1e-9) return String(Math.round(amount));
  return String(parseFloat(amount.toFixed(2)));
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

/** Scale mass/volume for readable display: 1000 g → 1 kg, 1000 ml → 1 l. */
export function scaleForDisplay(
  amount: number,
  canonicalUnit: string
): { amount: number; unit: string } {
  if (canonicalUnit === 'g' && amount >= 1000) {
    return { amount: amount / 1000, unit: 'kg' };
  }
  if (canonicalUnit === 'kg' && amount > 0 && amount < 1) {
    return { amount: amount * 1000, unit: 'g' };
  }
  if (canonicalUnit === 'ml' && amount >= 1000) {
    return { amount: amount / 1000, unit: 'l' };
  }
  if (canonicalUnit === 'l' && amount > 0 && amount < 1) {
    return { amount: amount * 1000, unit: 'ml' };
  }
  return { amount, unit: canonicalUnit };
}

export function formatQuantity(amount: number, canonicalUnit: string): string {
  const scaled = scaleForDisplay(amount, canonicalUnit);
  const rounded = formatNumber(scaled.amount);

  if (!scaled.unit) return rounded;

  const pair = UNIT_DISPLAY[scaled.unit];
  const label = pair ? (scaled.amount === 1 ? pair[0] : pair[1]) : scaled.unit;
  return `${rounded} ${label}`.trim();
}

function toBaseQuantity(parsed: {
  amount: number;
  unit: string;
}): { family: QuantityFamily | string; baseAmount: number } | null {
  if (!parsed.unit) {
    return { family: 'unit:', baseAmount: parsed.amount };
  }
  const info = UNIT_BASE[parsed.unit];
  if (info) {
    return { family: info.family, baseAmount: parsed.amount * info.factor };
  }
  return { family: `discrete:${parsed.unit}`, baseAmount: parsed.amount };
}

function formatFromBase(baseAmount: number, family: QuantityFamily): string {
  if (family === 'mass') {
    return baseAmount >= 1000
      ? formatQuantity(baseAmount / 1000, 'kg')
      : formatQuantity(baseAmount, 'g');
  }
  return baseAmount >= 1000
    ? formatQuantity(baseAmount / 1000, 'l')
    : formatQuantity(baseAmount, 'ml');
}

/** Sum two quantity strings when units are compatible (incl. g+kg, ml+l). */
export function sumQuantities(a: string, b: string): string | null {
  const pa = parseQuantity(a);
  const pb = parseQuantity(b);
  if (!pa || !pb) return null;

  const ba = toBaseQuantity(pa);
  const bb = toBaseQuantity(pb);
  if (!ba || !bb || ba.family !== bb.family) return null;

  const sum = ba.baseAmount + bb.baseAmount;
  if (ba.family === 'mass' || ba.family === 'volume') {
    return formatFromBase(sum, ba.family);
  }

  // Same discrete unit (unidad, atado, …)
  if (pa.unit === pb.unit) {
    return formatQuantity(sum, pa.unit);
  }
  return null;
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
              existing.category = preferredCategory(
                existing.category,
                resolveIngredientCategory(ing.name, ing.category)
              );

              const parsedExisting = parseQuantity(existing.quantity);
              const parsedIncoming = parseQuantity(ing.quantity);
              const summed =
                parsedExisting && parsedIncoming
                  ? sumQuantities(existing.quantity, ing.quantity)
                  : null;

              if (summed) {
                existing.quantity = summed;
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
                category: resolveIngredientCategory(ing.name, ing.category),
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
