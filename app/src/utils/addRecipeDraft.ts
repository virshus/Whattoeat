import type { Recipe } from '../types';

export type AddRecipeMethod = 'options' | 'manual' | 'instagram' | 'web';

export const ADD_RECIPE_OPEN_KEY = 'whattoeat:add-recipe-open';
export const ADD_RECIPE_DRAFT_KEY = 'whattoeat:add-recipe-draft';

export interface AddRecipeDraft {
  editingRecipeId: string | null;
  method: AddRecipeMethod;
  url: string;
  title: string;
  imageUrl: string;
  servings: number | null;
  time: string;
  tags: string[];
  ingredients: { id: string; name: string; quantity: string }[];
  instructions: { id: string; text: string }[];
  sourceUrl: string;
  sourceName: string;
  importWarning: string | null;
  importError: string | null;
}

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Quota / private mode — ignore
  }
}

function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function readAddRecipeOpen(): boolean {
  return safeGet(ADD_RECIPE_OPEN_KEY) === '1';
}

export function writeAddRecipeOpen(isOpen: boolean): void {
  if (isOpen) safeSet(ADD_RECIPE_OPEN_KEY, '1');
  else safeRemove(ADD_RECIPE_OPEN_KEY);
}

export function readAddRecipeDraft(): AddRecipeDraft | null {
  const raw = safeGet(ADD_RECIPE_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AddRecipeDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.method) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAddRecipeDraft(draft: AddRecipeDraft): void {
  safeSet(ADD_RECIPE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearAddRecipeDraft(): void {
  safeRemove(ADD_RECIPE_DRAFT_KEY);
  safeRemove(ADD_RECIPE_OPEN_KEY);
}

/** Clears only the form draft, keeping the "sheet open" flag. */
export function clearAddRecipeFormDraft(): void {
  safeRemove(ADD_RECIPE_DRAFT_KEY);
}

export function draftFromRecipe(recipe: Recipe): Omit<
  AddRecipeDraft,
  'method' | 'url' | 'importWarning' | 'importError'
> {
  return {
    editingRecipeId: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    servings: recipe.servings ?? null,
    time: recipe.prepTime?.replace(/\D/g, '') || '',
    tags: recipe.tags ? recipe.tags.map((t) => t.label) : [],
    ingredients:
      recipe.ingredients && recipe.ingredients.length > 0
        ? recipe.ingredients.map((i) => ({
            id: Math.random().toString(36).slice(2, 9),
            name: i.name,
            quantity: i.quantity,
          }))
        : [{ id: '1', name: '', quantity: '' }],
    instructions:
      recipe.instructions && recipe.instructions.length > 0
        ? recipe.instructions.map((i) => ({
            id: Math.random().toString(36).slice(2, 9),
            text: i.text,
          }))
        : [{ id: '1', text: '' }],
    sourceUrl: recipe.source?.url || '',
    sourceName: recipe.source?.name || '',
  };
}
