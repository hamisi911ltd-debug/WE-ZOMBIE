export async function handleCourses(request: Request, env: any): Promise<Response> {
  // Mock courses data
  const mockCourses = [
    { id: '1', title: 'Class B – Light Motor Vehicle', description: 'Standard car licence', fee: 14300, category: 'Light Vehicle' },
    { id: '2', title: 'Class C – Medium Goods Vehicle', description: 'Medium goods vehicle licence', fee: 15300, category: 'Commercial' },
    { id: '3', title: 'Class A – Motorcycle', description: 'Motorcycle licence', fee: 9200, category: 'Motorcycle' }
  ];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockCourses), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}