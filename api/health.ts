import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getHealthPayload } from '../app/server/handlers.ts';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json(getHealthPayload());
}
