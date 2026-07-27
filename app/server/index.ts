import './loadEnv.ts';
import express from 'express';
import { getHealthPayload, runImportRecipe } from './handlers.ts';

const app = express();
const PORT = Number(process.env.IMPORT_API_PORT || 3001);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json(getHealthPayload());
});

app.post('/api/import-recipe', async (req, res) => {
  const result = await runImportRecipe(req.body);
  if (result.ok === false) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result.draft);
});
app.listen(PORT, () => {
  console.log(`Import API listening on http://localhost:${PORT}`);
});
