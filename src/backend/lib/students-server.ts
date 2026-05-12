export async function handleStudents(request: Request, env: any): Promise<Response> {
  // Mock students data
  const mockStudents = [
    { id: '1', fullName: 'John Doe', email: 'john@example.com', phone: '0712345678' },
    { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', phone: '0723456789' }
  ];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockStudents), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}