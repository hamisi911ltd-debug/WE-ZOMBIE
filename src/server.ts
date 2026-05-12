import "./backend/lib/error-capture";
import { consumeLastCapturedError } from "./backend/lib/error-capture";
import { renderErrorPage } from "./backend/lib/error-page";

// Import API handlers
import { handleAuth } from "./backend/lib/auth-server";
import { handleStudents } from "./backend/lib/students-server";
import { handleCourses } from "./backend/lib/courses-server";
import { handleDashboard } from "./backend/lib/dashboard-server";
import { handleSchedule } from "./backend/lib/schedule-server";
import { handlePayments } from "./backend/lib/payments-server";
import { handleEnrollments } from "./backend/lib/enrollments-server";
import { handleUsers } from "./backend/lib/users-server";

export let cloudflareEnv: any;

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    
    // Let Cloudflare handle asset requests automatically - don't intercept them
    if (url.pathname.startsWith('/assets/')) {
      // Return undefined to let Cloudflare's asset serving handle it
      return undefined;
    }
    
    // Diagnostic endpoint
    if (url.pathname === '/__diagnostic') {
      return new Response(JSON.stringify({
        status: 'OK',
        message: 'Worker is running',
        hasEnv: !!env,
        hasDB: !!env?.DB,
        envKeys: env ? Object.keys(env) : [],
        url: request.url,
        method: request.method
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('=== Worker Start ===');
    console.log('Request URL:', request.url);
    console.log('Has env:', !!env);
    console.log('Has DB:', !!env?.DB);
    
    cloudflareEnv = env;
    
    try {
      // Handle alternative asset URLs to bypass ad blockers
      if (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/static/')) {
        // Map alternative URLs to actual asset paths
        let assetPath = '';
        if (url.pathname.startsWith('/js/main.js')) {
          assetPath = '/assets/index-xWlDSynZ.js';
        } else if (url.pathname.startsWith('/js/vendor.js')) {
          assetPath = '/assets/vendor-Dee5hF1J.js';
        } else if (url.pathname.startsWith('/css/main.css')) {
          assetPath = '/assets/index-w4TqjGaB.css';
        }
        
        if (assetPath) {
          // Redirect to the actual asset
          return Response.redirect(new URL(assetPath, url.origin).toString(), 302);
        }
      }
      
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        const apiPath = url.pathname.replace('/api', '');
        
        // Auth routes
        if (apiPath.startsWith('/auth/')) {
          return await handleAuth(request, env);
        }
        
        // Students routes
        if (apiPath.startsWith('/students')) {
          return await handleStudents(request, env);
        }
        
        // Courses routes
        if (apiPath.startsWith('/courses')) {
          return await handleCourses(request, env);
        }
        
        // Dashboard routes
        if (apiPath.startsWith('/dashboard')) {
          return await handleDashboard(request, env);
        }
        
        // Schedule routes
        if (apiPath.startsWith('/schedule')) {
          return await handleSchedule(request, env);
        }
        
        // Payments routes
        if (apiPath.startsWith('/payments')) {
          return await handlePayments(request, env);
        }
        
        // Enrollments routes
        if (apiPath.startsWith('/enrollments')) {
          return await handleEnrollments(request, env);
        }
        
        // Users routes
        if (apiPath.startsWith('/users')) {
          return await handleUsers(request, env);
        }
        
        return new Response('API endpoint not found', { status: 404 });
      }
      
      // Handle favicon specifically
      if (url.pathname === '/favicon.ico') {
        // Return a simple favicon
        return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚗</text></svg>`, {
          headers: { 
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
      
      // Handle asset requests - let Cloudflare Workers handle them automatically
      // Assets should be served by the assets directory configuration in wrangler.jsonc
      if (url.pathname.startsWith('/assets/')) {
        // Don't handle assets in the worker - let them fall through to Cloudflare's asset serving
        // This will cause a 404 in the worker, but Cloudflare should serve them from assets directory
        return new Response('Not found', { status: 404 });
      }
      
      // For all other requests (SPA routing), serve the index.html
      return new Response(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Immacurate Driving School</title>
    <meta name="description" content="Professional driver training for all licence categories" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>" />
    <script type="module" crossorigin src="/js/main.js"></script>
    <link rel="modulepreload" crossorigin href="/js/vendor.js">
    <link rel="stylesheet" crossorigin href="/css/main.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`, {
        headers: { 'Content-Type': 'text/html' }
      });
      
    } catch (error) {
      console.error("=== Detailed Worker Error ===");
      console.error("Error:", error);
      if (error instanceof Error) {
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        console.error("Name:", error.name);
      }
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
