import { GoogleGenAI } from '@google/genai';
import {
  ALLOWED_IMPORT_TAGS,
  filterAllowedTags,
  type ImportSource,
  type RecipeImportDraft,
} from '../src/types/importRecipe.ts';

const MAX_TEXT_CHARS = 40_000;

export interface PageExtract {
  url: string;
  source: ImportSource;
  ogTitle: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  jsonLdRecipe: unknown | null;
  text: string;
  warnings: string[];
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMetaContent(html: string, property: string): string | null {
  const propRe = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const contentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  const m = html.match(propRe) || html.match(contentFirst);
  return m?.[1]?.trim() || null;
}

function extractJsonLdRecipes(html: string): unknown | null {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const recipes: unknown[] = [];

  for (const match of scripts) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const type = (item as { '@type'?: string | string[] })['@type'];
        const types = Array.isArray(type) ? type : type ? [type] : [];
        if (types.some((t) => String(t).toLowerCase().includes('recipe'))) {
          recipes.push(item);
        }
        const graph = (item as { '@graph'?: unknown[] })['@graph'];
        if (Array.isArray(graph)) {
          for (const node of graph) {
            if (!node || typeof node !== 'object') continue;
            const nt = (node as { '@type'?: string | string[] })['@type'];
            const nts = Array.isArray(nt) ? nt : nt ? [nt] : [];
            if (nts.some((t) => String(t).toLowerCase().includes('recipe'))) {
              recipes.push(node);
            }
          }
        }
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }

  return recipes[0] ?? null;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; WhattoeatRecipeImporter/1.0; +https://localhost)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`No pudimos leer ese link (HTTP ${res.status}).`);
  }
  return await res.text();
}

async function fetchInstagramOEmbed(url: string): Promise<{
  title: string | null;
  thumbnail: string | null;
  author: string | null;
} | null> {
  try {
    const endpoint = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; WhattoeatRecipeImporter/1.0; +https://localhost)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      thumbnail_url?: string;
      author_name?: string;
    };
    return {
      title: data.title?.trim() || null,
      thumbnail: data.thumbnail_url?.trim() || null,
      author: data.author_name?.trim() || null,
    };
  } catch {
    return null;
  }
}

export async function extractPageContent(url: string, source: ImportSource): Promise<PageExtract> {
  if (!isHttpUrl(url)) {
    throw Object.assign(new Error('URL inválida. Usá un link http o https.'), { status: 400 });
  }

  const warnings: string[] = [];
  let html = '';
  let oembed: Awaited<ReturnType<typeof fetchInstagramOEmbed>> = null;

  try {
    html = await fetchHtml(url);
  } catch (err) {
    if (source === 'instagram') {
      warnings.push('No pudimos leer la página de Instagram completa.');
    } else {
      throw Object.assign(
        new Error(err instanceof Error ? err.message : 'No pudimos leer ese link.'),
        { status: 502 }
      );
    }
  }

  if (source === 'instagram') {
    oembed = await fetchInstagramOEmbed(url);
  }

  const ogTitle = html ? getMetaContent(html, 'og:title') : null;
  const ogImage = html ? getMetaContent(html, 'og:image') : oembed?.thumbnail ?? null;
  const ogDescription = html ? getMetaContent(html, 'og:description') : null;
  const jsonLdRecipe = html ? extractJsonLdRecipes(html) : null;

  let text = html ? stripHtmlToText(html) : '';
  if (oembed?.title) {
    text = `Instagram caption/title: ${oembed.title}\n\n${text}`;
  }
  if (ogDescription) {
    text = `og:description: ${ogDescription}\n\n${text}`;
  }
  if (ogTitle) {
    text = `og:title: ${ogTitle}\n\n${text}`;
  }
  if (jsonLdRecipe) {
    text = `JSON-LD Recipe:\n${JSON.stringify(jsonLdRecipe).slice(0, 15_000)}\n\n${text}`;
  }

  text = text.slice(0, MAX_TEXT_CHARS);

  if (!text.trim() && !ogTitle && !oembed?.title) {
    warnings.push('No se encontró texto usable en el link.');
  }

  if (source === 'instagram' && !oembed?.title && !ogDescription) {
    warnings.push(
      'Instagram no devolvió el caption. Completá los datos a mano si faltan.'
    );
  }

  return {
    url,
    source,
    ogTitle: ogTitle || oembed?.title || null,
    ogImage: ogImage || oembed?.thumbnail || null,
    ogDescription,
    jsonLdRecipe,
    text,
    warnings,
  };
}

const RECIPE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: ['string', 'null'] },
    imageUrl: { type: ['string', 'null'] },
    prepTimeMinutes: { type: ['number', 'null'] },
    servings: { type: ['number', 'null'] },
    ingredients: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: ['string', 'null'] },
        },
        required: ['name', 'quantity'],
      },
    },
    instructions: {
      type: ['array', 'null'],
      items: { type: 'string' },
    },
    tags: {
      type: ['array', 'null'],
      items: { type: 'string' },
    },
    sourceName: { type: ['string', 'null'] },
    warnings: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'title',
    'imageUrl',
    'prepTimeMinutes',
    'servings',
    'ingredients',
    'instructions',
    'tags',
    'sourceName',
    'warnings',
  ],
};

function emptyStringToNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t.length ? t : null;
}

function normalizeDraft(raw: Partial<RecipeImportDraft>, extract: PageExtract): RecipeImportDraft {
  let ingredients = raw.ingredients ?? null;
  if (Array.isArray(ingredients)) {
    ingredients = ingredients
      .map((ing) => ({
        name: (ing?.name || '').trim(),
        quantity: emptyStringToNull(ing?.quantity ?? null),
      }))
      .filter((ing) => ing.name.length > 0);
    if (ingredients.length === 0) ingredients = null;
  }

  let instructions = raw.instructions ?? null;
  if (Array.isArray(instructions)) {
    instructions = instructions.map((s) => String(s || '').trim()).filter(Boolean);
    if (instructions.length === 0) instructions = null;
  }

  const tags = filterAllowedTags(raw.tags ?? null);

  const title = emptyStringToNull(raw.title) ?? emptyStringToNull(extract.ogTitle);
  const imageUrl =
    emptyStringToNull(raw.imageUrl) ?? emptyStringToNull(extract.ogImage);

  const prepTimeMinutes =
    typeof raw.prepTimeMinutes === 'number' && Number.isFinite(raw.prepTimeMinutes)
      ? raw.prepTimeMinutes
      : null;
  const servings =
    typeof raw.servings === 'number' && Number.isFinite(raw.servings) ? raw.servings : null;

  const warnings = [
    ...(extract.warnings || []),
    ...(Array.isArray(raw.warnings) ? raw.warnings.filter(Boolean) : []),
  ];

  if (!ingredients) {
    warnings.push('No se encontró lista de ingredientes.');
  }
  if (!instructions) {
    warnings.push('No se encontraron pasos de preparación.');
  }

  return {
    title,
    imageUrl,
    prepTimeMinutes,
    servings,
    ingredients,
    instructions,
    tags: tags.length ? tags : [],
    sourceName: emptyStringToNull(raw.sourceName),
    warnings: [...new Set(warnings)],
  };
}

function geminiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw) as { error?: { code?: number; message?: string } };
    const code = parsed.error?.code;
    const message = parsed.error?.message ?? '';
    if (code === 401 || code === 403) {
      return 'API key de Gemini inválida. Revisá GEMINI_API_KEY en .env.local (obtenela en https://aistudio.google.com/apikey).';
    }
    if (code === 429) {
      return 'Cuota de Gemini agotada. Esperá unos minutos o revisá tu plan en Google AI Studio.';
    }
    if (message) return message.split('\n')[0] ?? raw;
  } catch {
    // not JSON
  }
  if (/API key|API_KEY|invalid.*key/i.test(raw)) {
    return 'API key de Gemini inválida. Revisá GEMINI_API_KEY en .env.local.';
  }
  return raw;
}

export async function analyzeWithGemini(extract: PageExtract): Promise<RecipeImportDraft> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('Falta GEMINI_API_KEY. Configurala en .env.local.'),
      { status: 503 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const allowedTags = ALLOWED_IMPORT_TAGS.join(', ');

  const prompt = `Sos un extractor de recetas. Analizá SOLO el contenido provisto del link.

Reglas estrictas:
- Extraé únicamente hechos presentes en el contenido.
- Si un campo no aparece, devolvé null (nunca inventes).
- No inventes ingredientes, cantidades, tiempos, porciones ni pasos "típicos".
- No uses placeholders como "al gusto" si no están en el texto.
- Tags: solo si hay evidencia textual clara. Elegí exclusivamente de esta lista: ${allowedTags}. Si dudás, tags = [].
- Preferí JSON-LD Recipe cuando exista sobre el texto libre.
- Idioma de salida: español. Si el source está en otro idioma, traducí solo lo extraído, sin añadir información.
- imageUrl: usá una URL de imagen presente en el contenido (og:image u otra). Si no hay, null.
- prepTimeMinutes y servings: números solo si aparecen explícitos.

URL: ${extract.url}
Fuente: ${extract.source}
og:title: ${extract.ogTitle ?? 'null'}
og:image: ${extract.ogImage ?? 'null'}

CONTENIDO:
${extract.text || '(vacío)'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: RECIPE_JSON_SCHEMA,
      temperature: 0.1,
    },
  }).catch((err: unknown) => {
    throw Object.assign(new Error(geminiErrorMessage(err)), { status: 502 });
  });

  const text = response.text;
  if (!text) {
    return normalizeDraft({}, extract);
  }

  let parsed: Partial<RecipeImportDraft> = {};
  try {
    parsed = JSON.parse(text) as Partial<RecipeImportDraft>;
  } catch {
    extract.warnings.push('No se pudo interpretar la respuesta del modelo.');
    return normalizeDraft({}, extract);
  }

  return normalizeDraft(parsed, extract);
}

export async function importRecipe(url: string, source: ImportSource): Promise<RecipeImportDraft> {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(
      new Error('Falta GEMINI_API_KEY. Configurala en .env.local.'),
      { status: 503 }
    );
  }
  const extract = await extractPageContent(url, source);
  return analyzeWithGemini(extract);
}
