export async function handleUsers(request: Request, env: any): Promise<Response> {
  // Mock users data
  const mockUsers = [
    { id: '1', fullName: 'Admin User', email: 'admin@immacurate.co.ke', role: 'admin', phone: '0712345678', createdAt: '2026-01-01' }
  ];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockUsers), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'POST') {
    const body = await request.json();
    const newUser = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    return new Response(JSON.stringify(newUser), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}