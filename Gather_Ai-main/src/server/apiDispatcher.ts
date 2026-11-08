import type { IncomingMessage, ServerResponse } from 'http';
import { 
  generateHarvestGuidance, 
  generateRecoveryExplanation, 
  generateCollectionRequestDraft, 
  executeGatherBrain,
  executeCropAdvice,
  executeHarvestReadiness,
  executeSurplusRecommendation,
  executeRecoveryMatchExplanation,
  executeCollectionRequest,
  executeGatherAssistant,
  executeCrossModuleInsights,
  checkServerAiHealth,
  executeMarketplaceListingAssistant,
  executeMarketplaceQueryInterpreter,
  type BrainTaskType
} from './groqService.ts';

/**
 * Standard CORS and Security Headers
 */
export const API_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

/**
 * Parse JSON body from either pre-parsed req.body (e.g. Vercel) or raw IncomingMessage stream
 */
export function readJsonBody(req: IncomingMessage & { body?: any }, maxBytes = 100000): Promise<any> {
  // If platform already parsed body (e.g. Vercel / Express)
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(req.body.trim() ? JSON.parse(req.body) : {});
      } catch {
        return Promise.reject(new Error('INVALID_JSON_BODY'));
      }
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error('REQUEST_PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw || raw.trim().length === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch {
        reject(new Error('INVALID_JSON_BODY'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Send JSON response supporting both Node ServerResponse and Vercel/Express res
 */
export function sendJson(res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => void }, statusCode: number, data: unknown) {
  // Vercel / Express helper
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    Object.entries(API_HEADERS).forEach(([k, v]) => {
      if (typeof (res as any).setHeader === 'function') {
        (res as any).setHeader(k, v);
      }
    });
    return res.status(statusCode).json(data);
  }

  // Native Node.js ServerResponse
  res.writeHead(statusCode, API_HEADERS);
  res.end(JSON.stringify(data));
}

/**
 * Maps internal server & provider errors to safe user-facing responses
 */
export function mapErrorToResponse(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);

  // Safe server-side diagnostic logging (never log API keys)
  console.error('[Gather AI API Error]:', msg);

  if (msg === 'GROQ_API_KEY_MISSING') {
    return {
      status: 503,
      message: 'GROQ_API_KEY is not configured in the server environment. Please set GROQ_API_KEY to enable live AI features.',
    };
  }
  if (msg === 'RATE_LIMITED' || msg.includes('429')) {
    return {
      status: 429,
      message: 'AI request limit reached on GroqCloud. Please wait a few moments and try again.',
    };
  }
  if (msg === 'AUTHENTICATION_FAILED' || msg.includes('401') || msg.includes('403')) {
    return {
      status: 401,
      message: 'AI authentication failed. Please verify that GROQ_API_KEY is valid on the server.',
    };
  }
  if (msg === 'AI_REQUEST_TIMEOUT') {
    return {
      status: 504,
      message: 'The AI request timed out. Please try again in a moment.',
    };
  }
  if (msg === 'REQUEST_PAYLOAD_TOO_LARGE') {
    return {
      status: 413,
      message: 'Request payload exceeded the permitted size limit.',
    };
  }
  if (msg.includes('is required') || msg === 'INVALID_JSON_BODY') {
    return {
      status: 400,
      message: msg,
    };
  }

  // Safe fallback to prevent leaking stack traces
  return {
    status: 500,
    message: 'An unexpected error occurred while communicating with the AI service. Please try again later.',
  };
}

/**
 * Normalized API Route Dispatcher
 * Handles all Gather AI endpoints uniformly across Vite dev server, Vite preview, Node server, and Vercel.
 */
export async function dispatchApiRequest(
  req: IncomingMessage & { body?: any; query?: any },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => void }
): Promise<boolean> {
  const rawUrl = req.url || '';
  let pathname = rawUrl.split('?')[0] || '';

  // Remove trailing slashes (e.g. /api/gather-assistant/ -> /api/gather-assistant)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Support /api or nested path calls
  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, API_HEADERS);
    res.end();
    return true;
  }

  try {
    // 1. Health check & model status
    if (pathname === '/api/health' && req.method === 'GET') {
      const health = await checkServerAiHealth();
      sendJson(res, 200, health);
      return true;
    }

    // 2. Unified Gather AI Brain Dispatcher
    if (pathname === '/api/brain' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const task = (body.task || 'gather_assistant') as BrainTaskType;
      const payload = body.input || body.payload || body;
      const result = await executeGatherBrain(task, payload);
      sendJson(res, 200, result);
      return true;
    }

    // 3. Task: Crop Advice & Harvest Guidance
    if ((pathname === '/api/crop-advice' || pathname === '/api/harvest-guidance') && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (pathname === '/api/crop-advice') {
        const result = await executeCropAdvice(body);
        sendJson(res, 200, result);
      } else {
        const guidance = await generateHarvestGuidance(body);
        sendJson(res, 200, guidance);
      }
      return true;
    }

    // 4. Task: Harvest Readiness
    if (pathname === '/api/harvest-readiness' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeHarvestReadiness(body);
      sendJson(res, 200, result);
      return true;
    }

    // 5. Task: Surplus Recommendation
    if (pathname === '/api/surplus-recommendation' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeSurplusRecommendation(body);
      sendJson(res, 200, result);
      return true;
    }

    // 6. Task: Recovery Partner Match Explanation
    if (pathname === '/api/recovery-explanation' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const explanation = await generateRecoveryExplanation(body);
      sendJson(res, 200, explanation);
      return true;
    }

    if (pathname === '/api/recovery-match-explanation' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeRecoveryMatchExplanation(body);
      sendJson(res, 200, result);
      return true;
    }

    // 7. Task: Collection Request Drafting
    if (pathname === '/api/draft-request' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const draft = await generateCollectionRequestDraft(body);
      sendJson(res, 200, draft);
      return true;
    }

    if (pathname === '/api/collection-request' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeCollectionRequest(body);
      sendJson(res, 200, result);
      return true;
    }

    // 8. Task: Ask Gather AI Assistant
    if (pathname === '/api/gather-assistant' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeGatherAssistant(body);
      sendJson(res, 200, result);
      return true;
    }

    // 9. Task: Cross-Module Insights
    if (pathname === '/api/cross-module-insights' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeCrossModuleInsights(body);
      sendJson(res, 200, result);
      return true;
    }

    // 10. Task: Marketplace Listing Improvement Assistant
    if (pathname === '/api/marketplace-improve-description' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeMarketplaceListingAssistant(body);
      sendJson(res, 200, result);
      return true;
    }

    // 11. Task: Marketplace Natural Language Search Interpreter
    if (pathname === '/api/marketplace-search' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await executeMarketplaceQueryInterpreter(body);
      sendJson(res, 200, result);
      return true;
    }

    // Route not found under /api/
    sendJson(res, 404, { error: `Endpoint '${pathname}' not found on Gather AI server.` });
    return true;
  } catch (err) {
    const { status, message } = mapErrorToResponse(err);
    sendJson(res, status, { error: message });
    return true;
  }
}
