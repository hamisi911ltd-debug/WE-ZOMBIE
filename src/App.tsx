import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/auth-context';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import RoleSelectionPage from './pages/LoginPage'; // Renamed for clarity - this is now role selection
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import PaymentsPage from './pages/PaymentsPage';
import SchedulePage from './pages/SchedulePage';
import StudentsPage from './pages/StudentsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCoursesManagement from './pages/admin/CoursesManagement';
import AdminPaymentsManagement from './pages/admin/PaymentsManagement';
import AdminUsersManagement from './pages/admin/UsersManagement';
import AdminLayout from './components/AdminLayout';

// Styles
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Role Selection as Landing Page */}
              <Route path="/select-role" element={<RoleSelectionPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCoursesManagement />} />
                <Route path="payments" element={<AdminPaymentsManagement />} />
                <Route path="users" element={<AdminUsersManagement />} />
                <Route path="students" element={<StudentsPage />} />
              </Route>
              
              {/* Catch all - redirect to role selection if not authenticated */}
              <Route path="*" element={<Navigate to="/select-role" replace />} />
            </Routes>
          </div>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;