export async function handlePayments(request: Request, env: any): Promise<Response> {
  // Mock payments data
  const mockPayments = [];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockPayments), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}