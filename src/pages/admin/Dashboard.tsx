import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    pendingPayments: 0,
    completedCertificates: 0,
    upcomingLessons: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      // TODO: Implement real API call
      // For now, using mock data
      setStats({
        totalStudents: 45,
        activeCourses: 7,
        totalEnrollments: 68,
        pendingPayments: 12,
        completedCertificates: 23,
        upcomingLessons: 15,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statsCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/students',
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      icon: GraduationCap,
      color: 'bg-green-500',
      link: '/admin/courses',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: BookOpen,
      color: 'bg-purple-500',
      link: '/admin/enrollments',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: DollarSign,
      color: 'bg-amber-500',
      link: '/admin/payments',
    },
    {
      title: 'Certificates Issued',
      value: stats.completedCertificates,
      icon: Award,
      color: 'bg-indigo-500',
      link: '/admin/certificates',
    },
    {
      title: 'Upcoming Lessons',
      value: stats.upcomingLessons,
      icon: Calendar,
      color: 'bg-pink-500',
      link: '/admin/schedule',
    },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1e293b] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin control panel</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 font-display">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </Link>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/students" className="btn-brand justify-center">
            <Users className="w-4 h-4" />
            Add Student
          </Link>
          <Link to="/admin/courses" className="btn-brand justify-center">
            <GraduationCap className="w-4 h-4" />
            Manage Courses
          </Link>
          <Link to="/admin/enrollments" className="btn-brand justify-center">
            <BookOpen className="w-4 h-4" />
            New Enrollment
          </Link>
          <Link to="/admin/tests" className="btn-brand justify-center">
            <Clock className="w-4 h-4" />
            Create Test
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New student enrolled</p>
              <p className="text-sm text-gray-600">John Doe enrolled in Class B</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Certificate issued</p>
              <p className="text-sm text-gray-600">Jane Smith completed Class A</p>
            </div>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Course updated</p>
              <p className="text-sm text-gray-600">Class B curriculum revised</p>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
