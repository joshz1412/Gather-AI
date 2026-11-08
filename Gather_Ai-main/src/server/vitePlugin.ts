import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { dispatchApiRequest } from './apiDispatcher.ts';

/**
 * Vite Plugin that provides live Gather AI server endpoints for both
 * development (`vite`) and preview (`vite preview`).
 */
export function groqAiApiPlugin(): Plugin {
  return {
    name: 'gather-ai-groq-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // Only intercept /api routes
        if (!url || !url.startsWith('/api/')) {
          return next();
        }

        const handled = await dispatchApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // Only intercept /api routes in preview server
        if (!url || !url.startsWith('/api/')) {
          return next();
        }

        const handled = await dispatchApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
  };
}
