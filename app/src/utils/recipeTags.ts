import { ALLOWED_IMPORT_TAGS } from '../types/importRecipe';
import type { Recipe } from '../types';

const BLOCKED_TAGS = new Set(['keto']);

function storageKey(householdId: string): string {
  return `whattoeat:custom-tags:${householdId}`;
}

function normalizeLabel(label: string): string {
  return label.trim();
}

function isBlocked(label: string): boolean {
  return BLOCKED_TAGS.has(label.trim().toLowerCase());
}

function readStoredCustomTags(householdId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(householdId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === 'string')
      .map(normalizeLabel)
      .filter((t) => t && !isBlocked(t));
  } catch {
    return [];
  }
}

function writeStoredCustomTags(householdId: string, tags: string[]): void {
  try {
    localStorage.setItem(storageKey(householdId), JSON.stringify(tags));
  } catch {
    // ignore quota / private mode
  }
}

/** Built-in selectable tags (no Keto). */
export const BUILTIN_RECIPE_TAGS: readonly string[] = ALLOWED_IMPORT_TAGS;

export function isBuiltinRecipeTag(label: string): boolean {
  const key = normalizeLabel(label).toLowerCase();
  return BUILTIN_RECIPE_TAGS.some((b) => b.toLowerCase() === key);
}

/**
 * Unique custom tags found on recipes (excluding builtins and blocked).
 */
export function collectTagsFromRecipes(recipes: Recipe[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const recipe of recipes) {
    for (const tag of recipe.tags ?? []) {
      const label = normalizeLabel(tag.label);
      if (!label || isBlocked(label)) continue;
      const key = label.toLowerCase();
      if ((BUILTIN_RECIPE_TAGS as readonly string[]).some((b) => b.toLowerCase() === key)) {
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(label);
    }
  }
  return out.sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Persist a newly created custom tag for the household (survives recipe delete).
 */
export function rememberCustomTag(householdId: string | null | undefined, label: string): string[] {
  const trimmed = normalizeLabel(label);
  if (!householdId || !trimmed || isBlocked(trimmed)) {
    return householdId ? readStoredCustomTags(householdId) : [];
  }
  const existing = readStoredCustomTags(householdId);
  const key = trimmed.toLowerCase();
  if (existing.some((t) => t.toLowerCase() === key)) return existing;
  if ((BUILTIN_RECIPE_TAGS as readonly string[]).some((b) => b.toLowerCase() === key)) {
    return existing;
  }
  const next = [...existing, trimmed].sort((a, b) => a.localeCompare(b, 'es'));
  writeStoredCustomTags(householdId, next);
  return next;
}

export function loadCustomTags(householdId: string | null | undefined): string[] {
  if (!householdId) return [];
  return readStoredCustomTags(householdId);
}

/** Remove a custom tag from the household catalog (builtins ignored). */
export function forgetCustomTag(householdId: string | null | undefined, label: string): string[] {
  if (!householdId) return [];
  const key = normalizeLabel(label).toLowerCase();
  if (!key || isBuiltinRecipeTag(label)) {
    return readStoredCustomTags(householdId);
  }
  const next = readStoredCustomTags(householdId).filter((t) => t.toLowerCase() !== key);
  writeStoredCustomTags(householdId, next);
  return next;
}

/** Strip a tag label from a recipe (case-insensitive). */
export function recipeWithoutTag(recipe: Recipe, label: string): Recipe {
  const key = normalizeLabel(label).toLowerCase();
  return {
    ...recipe,
    tags: (recipe.tags ?? []).filter((t) => t.label.toLowerCase() !== key),
  };
}

/**
 * All selectable recipe tags: builtins + stored customs + tags already on recipes.
 */
export function getSelectableRecipeTags(
  recipes: Recipe[],
  householdId?: string | null,
  extraSelected: string[] = []
): string[] {
  const stored = loadCustomTags(householdId);
  const fromRecipes = collectTagsFromRecipes(recipes);
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (label: string) => {
    const trimmed = normalizeLabel(label);
    if (!trimmed || isBlocked(trimmed)) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  };

  for (const t of BUILTIN_RECIPE_TAGS) push(t);
  for (const t of stored) push(t);
  for (const t of fromRecipes) push(t);
  for (const t of extraSelected) {
    const key = t.toLowerCase();
    if ((BUILTIN_RECIPE_TAGS as readonly string[]).some((b) => b.toLowerCase() === key)) continue;
    push(t);
  }

  // Builtins stay first in fixed order; customs alphabetical after.
  const builtins = BUILTIN_RECIPE_TAGS.filter((b) =>
    out.some((t) => t.toLowerCase() === b.toLowerCase())
  );
  const customs = out
    .filter((t) => !(BUILTIN_RECIPE_TAGS as readonly string[]).some((b) => b.toLowerCase() === t.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es'));

  return [...builtins, ...customs];
}

/** Filter chip labels: Favoritos + all selectable recipe tags. */
export function getRecipeFilterTags(recipes: Recipe[], householdId?: string | null): string[] {
  return ['Favoritos', ...getSelectableRecipeTags(recipes, householdId)];
}
