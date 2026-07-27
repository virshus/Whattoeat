import { Recipe, WeekPlan, ShoppingItem } from '../types';

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

function newItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;
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
            if (items[key]) {
              const match1 = items[key].quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
              const match2 = ing.quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

              if (match1 && match2 && match1[2] === match2[2]) {
                items[key].quantity = `${parseFloat(match1[1]) + parseFloat(match2[1])} ${match1[2]}`;
              } else if (!items[key].quantity.includes(ing.quantity)) {
                items[key].quantity += ` + ${ing.quantity}`;
              }
            } else {
              items[key] = {
                id: newItemId(),
                name: ing.name,
                quantity: ing.quantity,
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
