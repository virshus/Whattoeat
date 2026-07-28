export const ALLOWED_IMPORT_TAGS = [
  'Vegetariano',
  'Rápido',
  'Saludable',
  'Proteína',
] as const;

export type AllowedImportTag = (typeof ALLOWED_IMPORT_TAGS)[number];

export type ImportSource = 'instagram' | 'web';

export interface RecipeImportIngredient {
  name: string;
  quantity: string | null;
}

export interface RecipeImportDraft {
  title: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  servings: number | null;
  ingredients: RecipeImportIngredient[] | null;
  instructions: string[] | null;
  tags: string[] | null;
  sourceName: string | null;
  warnings?: string[];
}

export interface RecipeFormState {
  title: string;
  imageUrl: string;
  /** Empty string when unknown */
  time: string;
  /** null when unknown */
  servings: number | null;
  tags: string[];
  ingredients: { id: string; name: string; quantity: string }[];
  instructions: { id: string; text: string }[];
  sourceUrl: string;
  sourceName: string;
  importWarning: string | null;
}

function newId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function filterAllowedTags(tags: string[] | null | undefined): string[] {
  if (!tags?.length) return [];
  const allowed = new Set<string>(ALLOWED_IMPORT_TAGS);
  return [...new Set(tags.filter((t) => allowed.has(t)))];
}

/** Map a nullable import draft into form state. Never invents missing fields. */
export function mapDraftToForm(
  draft: RecipeImportDraft,
  source: ImportSource,
  sourceUrl: string
): RecipeFormState {
  const ingredients =
    draft.ingredients && draft.ingredients.length > 0
      ? draft.ingredients.map((ing) => ({
          id: newId(),
          name: ing.name || '',
          quantity: ing.quantity ?? '',
        }))
      : [{ id: newId(), name: '', quantity: '' }];

  const instructions =
    draft.instructions && draft.instructions.length > 0
      ? draft.instructions.map((text) => ({ id: newId(), text: text || '' }))
      : [{ id: newId(), text: '' }];

  const defaultSourceName =
    source === 'instagram' ? 'Agregada desde Instagram' : 'Agregada desde la web';

  const warnings = draft.warnings?.filter(Boolean) ?? [];
  const isSparse =
    !draft.title &&
    !(draft.ingredients && draft.ingredients.length) &&
    !(draft.instructions && draft.instructions.length);

  return {
    title: draft.title ?? '',
    imageUrl: draft.imageUrl ?? '',
    time: draft.prepTimeMinutes != null ? String(draft.prepTimeMinutes) : '',
    servings: draft.servings,
    tags: filterAllowedTags(draft.tags),
    ingredients,
    instructions,
    sourceUrl,
    sourceName: draft.sourceName ?? defaultSourceName,
    importWarning:
      warnings[0] ||
      (isSparse
        ? 'No encontramos todos los datos. Completá lo que falte.'
        : warnings.length
          ? warnings.join(' ')
          : null),
  };
}

export function emptyFormState(): Omit<RecipeFormState, 'sourceUrl' | 'sourceName' | 'importWarning'> {
  return {
    title: '',
    imageUrl: '',
    time: '',
    servings: null,
    tags: [],
    ingredients: [{ id: newId(), name: '', quantity: '' }],
    instructions: [{ id: newId(), text: '' }],
  };
}
