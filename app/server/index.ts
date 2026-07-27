import './loadEnv.ts';
import express from 'express';
import { importRecipe } from './importRecipe.ts';
import type { ImportSource } from '../src/types/importRecipe.ts';

const app = express();
const PORT = Number(process.env.IMPORT_API_PORT || 3001);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
});

app.post('/api/import-recipe', async (req, res) => {
  try {
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const source = req.body?.source as ImportSource;

    if (!url) {
      res.status(400).json({ error: 'Falta el link de la receta.' });
      return;
    }
    if (source !== 'instagram' && source !== 'web') {
      res.status(400).json({ error: 'Fuente inválida. Usá instagram o web.' });
      return;
    }

    const draft = await importRecipe(url, source);
    res.json(draft);
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
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Import API listening on http://localhost:${PORT}`);
});
