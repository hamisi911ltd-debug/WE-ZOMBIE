export async function handleEnrollments(request: Request, env: any): Promise<Response> {
  // Mock enrollments data
  const mockEnrollments = [];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockEnrollments), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}