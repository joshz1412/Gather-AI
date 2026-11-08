import http from 'http';
import fs from 'fs';
import path from 'path';
import { dispatchApiRequest } from './src/server/apiDispatcher.ts';

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const url = req.url?.split('?')[0] || '/';

  // API Routes
  if (url.startsWith('/api/')) {
    const handled = await dispatchApiRequest(req, res);
    if (handled) return;
  }

  // Static file serving from dist/
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    } catch {
      res.writeHead(404);
      return res.end('Not Found');
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Gather AI Server is running.');
});

server.listen(PORT, () => {
  console.log(`Gather AI Server listening on http://localhost:${PORT}`);
});
