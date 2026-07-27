import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runImportRecipe } from '../app/server/handlers.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = await runImportRecipe(req.body);
  if (result.ok === false) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json(result.draft);
}
