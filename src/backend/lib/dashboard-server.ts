export async function handleDashboard(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/dashboard', '');
  
  if (path === '/stats') {
    const mockStats = {
      activeCourses: 3,
      completedLessons: 12,
      upcomingLessons: 2,
      pendingPayments: 45000
    };
    
    return new Response(JSON.stringify(mockStats), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Dashboard endpoint not found', { status: 404 });
}