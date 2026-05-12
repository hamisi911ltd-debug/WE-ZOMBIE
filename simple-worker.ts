// Simple Cloudflare Worker for React SPA
// Serves static files and handles API routes

import { handleAPI } from './src/api-handler';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // Serve static assets
    try {
      const response = await env.ASSETS.fetch(request);
      
      // If asset not found, serve index.html for client-side routing
      if (response.status === 404) {
        const indexRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(indexRequest);
      }
      
      return response;
    } catch (error) {
      return new Response('Error loading page', { status: 500 });
    }
  },
};
