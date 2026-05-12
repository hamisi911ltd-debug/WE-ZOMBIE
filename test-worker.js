// Minimal test worker to verify Cloudflare Workers is working

export default {
  async fetch(request, env, ctx) {
    console.log('Worker received request:', request.url);
    console.log('Environment keys:', Object.keys(env));
    console.log('Has DB binding:', !!env.DB);
    
    // Test database
    if (env.DB) {
      try {
        const result = await env.DB.prepare('SELECT COUNT(*) as count FROM profiles').first();
        console.log('Database query result:', result);
        
        return new Response(JSON.stringify({
          status: 'OK',
          message: 'Worker and database are working!',
          dbResult: result,
          url: request.url
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({
          status: 'ERROR',
          message: 'Database error',
          error: error.message,
          stack: error.stack
        }, null, 2), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response(JSON.stringify({
      status: 'ERROR',
      message: 'No DB binding found',
      env: Object.keys(env)
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
