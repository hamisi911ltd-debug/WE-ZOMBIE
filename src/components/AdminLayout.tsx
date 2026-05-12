import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/backend/lib/auth-context';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  BookOpen,
  ClipboardCheck,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Info,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/select-role');
  };
  
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/courses', icon: GraduationCap, label: 'Courses' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/users', icon: UserCog, label: 'User Management' },
    { to: '/admin/enrollments', icon: BookOpen, label: 'Enrollments' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/admin/reports', icon: ClipboardCheck, label: 'Reports' },
    { to: '/admin/certificates', icon: Award, label: 'Certificates' },
    { to: '/admin/school-info', icon: Info, label: 'School Info' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 bg-[#1e293b] text-white fixed inset-y-0 left-0 z-50">
        <div className="p-2 border-b border-gray-700 bg-gradient-to-br from-[#1e293b] to-gray-900">
          <Link to="/admin/dashboard" className="flex justify-center">
            <img src="/logo.jpeg" alt="Immacurate Driving School" className="w-16 h-auto rounded-lg shadow-md" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#1e293b]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.email}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1e293b] text-white z-50 border-b border-gray-700">
        <div className="flex items-center justify-between p-2">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Immacurate Driving School" className="h-6 rounded" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="border-t border-gray-700 bg-[#1e293b] max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-white text-[#1e293b]'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-56 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
