import { Recipe, WeekPlan, ShoppingItem, MealSlot } from '../types';

export function hasRecipes(recipes: Recipe[]): boolean {
  return recipes.length > 0;
}

const HOME_RECIPES_LIMIT = 6;

function recipeRecency(recipe: Recipe): number {
  if (recipe.createdAt) {
    const t = Date.parse(recipe.createdAt);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function byNewestFirst(a: Recipe, b: Recipe): number {
  return recipeRecency(b) - recipeRecency(a);
}

/**
 * Display order: newest favorites first, then newest non-favorites.
 */
export function sortRecipesForDisplay(recipes: Recipe[]): Recipe[] {
  const favorites = recipes.filter((r) => r.isFavorite).sort(byNewestFirst);
  const rest = recipes.filter((r) => !r.isFavorite).sort(byNewestFirst);
  return [...favorites, ...rest];
}

/**
 * Home list: up to 6 recipes with the same display order.
 * If there are fewer than 6 total, return all.
 */
export function selectHomeRecipes(
  recipes: Recipe[],
  limit = HOME_RECIPES_LIMIT
): Recipe[] {
  return sortRecipesForDisplay(recipes).slice(0, limit);
}

export function plannedMealsCount(plan: WeekPlan): number {
  return plan.days.reduce(
    (acc, day) => acc + day.slots.filter((slot) => slot.recipeTitle).length,
    0
  );
}

export function isWeekEmpty(plan: WeekPlan): boolean {
  return plannedMealsCount(plan) === 0;
}

export function isShoppingEmpty(items: ShoppingItem[]): boolean {
  return items.filter((item) => !item.isChecked).length === 0;
}

export function isShoppingFullyEmpty(items: ShoppingItem[]): boolean {
  return items.length === 0;
}

export function isShoppingAllDone(items: ShoppingItem[]): boolean {
  return items.length > 0 && items.every((item) => item.isChecked);
}

export function getEmptyWeekCopy(hasRecipesLoaded: boolean) {
  if (!hasRecipesLoaded) {
    return {
      title: 'Primero cargá tus recetas',
      description: 'Importá o creá recetas para poder planificar tu semana.',
      actionLabel: 'Agregar receta',
    };
  }

  return {
    title: 'Tu semana está libre. ¿Qué comemos?',
    description: 'Planificá almuerzos y cenas de lunes a viernes.',
    actionLabel: 'Armá tu semana',
  };
}

export function getEmptyRecipesCopy() {
  return {
    title: 'Todavía no tenés recetas',
    description: 'Importá o creá tu primera receta para empezar a planificar.',
    actionLabel: 'Agregar receta',
  };
}

export function getEmptyShoppingCopy() {
  return {
    title: 'Planificá comidas para generar tu lista',
    description: 'Cuando agregues recetas al menú semanal, los ingredientes aparecen acá solos.',
    actionLabel: 'Ir al menú semanal',
  };
}

export function getShoppingAllDoneCopy() {
  return {
    title: '¡Listo! Compraste todo',
    description: 'No quedan ingredientes pendientes en tu lista.',
  };
}

export function getMealSlotPhrase(type: MealSlot['type']): string {
  return type === 'Cena' ? 'la cena' : 'el almuerzo';
}

export function getMealSlotSubtitle(type: MealSlot['type'], dayName: string): string {
  return `Para ${getMealSlotPhrase(type)} del ${dayName.toLowerCase()}`;
}
