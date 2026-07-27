import { importRecipe } from './importRecipe.ts';
import type { ImportSource } from '../src/types/importRecipe.ts';

export function getHealthPayload() {
  return {
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  };
}

export async function runImportRecipe(body: unknown): Promise<
  | { ok: true; status: 200; draft: Awaited<ReturnType<typeof importRecipe>> }
  | { ok: false; status: number; error: string }
> {
  const url = body && typeof body === 'object' && 'url' in body && typeof (body as { url: unknown }).url === 'string'
    ? (body as { url: string }).url.trim()
    : '';
  const source =
    body && typeof body === 'object' && 'source' in body
      ? ((body as { source: unknown }).source as ImportSource)
      : undefined;

  if (!url) {
    return { ok: false, status: 400, error: 'Falta el link de la receta.' };
  }
  if (source !== 'instagram' && source !== 'web') {
    return { ok: false, status: 400, error: 'Fuente inválida. Usá instagram o web.' };
  }

  try {
    const draft = await importRecipe(url, source);
    return { ok: true, status: 200, draft };
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err && typeof (err as { status: unknown }).status === 'number'
        ? (err as { status: number }).status
        : 500;
    const message =
      err instanceof Error
        ? err.message
        : 'No pudimos leer ese link. Probá otro o cargala manualmente.';
    console.error('[import-recipe]', message);
    return { ok: false, status, error: message };
  }
}
