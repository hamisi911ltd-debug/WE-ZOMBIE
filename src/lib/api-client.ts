// Client-side API functions
// Replaces TanStack Start's createServerFn with standard fetch calls

const API_BASE = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  signup: async (email: string, password: string, fullName?: string) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  },
  
  logout: async () => {
    return fetchAPI('/auth/logout', { method: 'POST' });
  },
  
  getSession: async () => {
    return fetchAPI('/auth/session');
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return fetchAPI('/dashboard/stats');
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    return fetchAPI('/courses');
  },
  
  getById: async (id: string) => {
    return fetchAPI(`/courses/${id}`);
  },
  
  create: async (data: any) => {
    return fetchAPI('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: any) => {
    return fetchAPI(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    return fetchAPI(`/courses/${id}`, { method: 'DELETE' });
  },
};

// Modules API
export const modulesAPI = {
  getById: async (courseId: string, moduleId: string) => {
    return fetchAPI(`/courses/${courseId}/modules/${moduleId}`);
  },
};

// Lesson Progress API
export const lessonProgressAPI = {
  update: async (lessonId: string, completed: boolean) => {
    return fetchAPI('/lesson-progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId, completed }),
    });
  },
};

// Schedule API
export const scheduleAPI = {
  getAll: async () => {
    return fetchAPI('/schedule');
  },
  
  create: async (data: {
    instructorId: string;
    moduleId?: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
  }) => {
    return fetchAPI('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    return fetchAPI('/payments');
  },
  
  create: async (data: {
    amount: number;
    dueDate: string;
    proofUrl?: string;
  }) => {
    return fetchAPI('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Students API (admin only)
export const studentsAPI = {
  getAll: async () => {
    return fetchAPI('/students');
  },
  
  create: async (data: {
    email: string;
    fullName: string;
    phone?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
    courseId?: string;
  }) => {
    return fetchAPI('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: {
    fullName?: string;
    phone?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
  }) => {
    return fetchAPI(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    return fetchAPI(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: async () => {
    return fetchAPI('/enrollments');
  },
  
  create: async (data: { courseId: string }) => {
    return fetchAPI('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: { status?: string }) => {
    return fetchAPI(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Users API (admin only)
export const usersAPI = {
  getAll: async () => {
    return fetchAPI('/users');
  },
  
  create: async (data: {
    email: string;
    fullName: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    return fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: {
    fullName?: string;
    phone?: string;
    role?: string;
    password?: string;
  }) => {
    return fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    return fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
