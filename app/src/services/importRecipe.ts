import type { RecipeImportDraft, ImportSource } from '../types/importRecipe';

export class ImportRecipeError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ImportRecipeError';
  }
}

export async function importRecipeFromUrl(
  url: string,
  source: ImportSource
): Promise<RecipeImportDraft> {
  const res = await fetch('/api/import-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, source }),
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
        ? (body as { error: string }).error
        : 'No pudimos leer ese link. Probá otro o cargala manualmente.';
    throw new ImportRecipeError(message, res.status);
  }

  return body as RecipeImportDraft;
}
