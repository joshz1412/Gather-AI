import { dispatchApiRequest } from '../src/server/apiDispatcher.ts';

export default async function handler(req: any, res: any) {
  req.url = '/api/gather-assistant';
  const handled = await dispatchApiRequest(req, res);
  if (!handled) {
    res.status(404).json({ error: 'Endpoint not found on Gather AI server.' });
  }
}
