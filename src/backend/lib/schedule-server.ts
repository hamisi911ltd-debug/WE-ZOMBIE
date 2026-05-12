export async function handleSchedule(request: Request, env: any): Promise<Response> {
  // Mock schedule data
  const mockSchedule = [
    { 
      id: '1', 
      moduleTitle: 'Basic Driving Skills',
      instructorName: 'John Smith',
      scheduledDate: '2026-05-12',
      startTime: '10:00',
      endTime: '12:00'
    }
  ];
  
  if (request.method === 'GET') {
    return new Response(JSON.stringify(mockSchedule), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}