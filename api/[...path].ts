import { dispatchApiRequest } from '../src/server/apiDispatcher.ts';

export default async function handler(req: any, res: any) {
  // Ensure req.url has /api/ prefix if rewritten
  if (req.url && !req.url.startsWith('/api/')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  const handled = await dispatchApiRequest(req, res);
  if (!handled) {
    res.status(404).json({ error: 'Endpoint not found on Gather AI server.' });
  }
}
