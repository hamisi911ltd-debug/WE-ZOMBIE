import { useEffect, useState } from 'react';
import { useAuth } from '@/backend/lib/auth-context';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CreditCard,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { dashboardAPI, scheduleAPI } from '@/lib/api-client';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [stats, setStats] = useState<any>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [statsData, scheduleData] = await Promise.all([
        dashboardAPI.getStats(),
        scheduleAPI.getAll(),
      ]);
      
      setStats(statsData);
      
      // Get upcoming lessons (next 3)
      const now = new Date();
      const upcoming = scheduleData
        .filter((entry: any) => new Date(entry.scheduledDate) >= now)
        .slice(0, 3);
      setUpcomingLessons(upcoming);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  const statsCards = [
    {
      label: 'Active Courses',
      value: stats?.activeCourses || 0,
      icon: GraduationCap,
      color: 'bg-blue-500',
      change: 'Enrolled',
    },
    {
      label: 'Completed Lessons',
      value: stats?.completedLessons || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: 'Total completed',
    },
    {
      label: 'Upcoming Lessons',
      value: stats?.upcomingLessons || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: upcomingLessons[0] ? `Next: ${new Date(upcomingLessons[0].scheduledDate).toLocaleDateString()}` : 'None scheduled',
    },
    {
      label: 'Pending Payments',
      value: `${stats?.pendingPayments || 0}`,
      icon: CreditCard,
      color: 'bg-amber-500',
      change: stats?.pendingPayments > 0 ? 'Action required' : 'All paid',
    },
  ];
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-brand-crimson to-brand-royal rounded-lg md:rounded-xl p-4 md:p-6 text-white">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-xs md:text-sm text-blue-100 mt-1">
          {isAdmin ? 'Manage your driving school efficiently' : 'Continue your driving journey'}
        </p>
      </div>

      {/* Mobile-Optimized Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`${stat.color} w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <p className="text-lg md:text-2xl font-bold text-gray-900 font-display">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1 md:mt-2 hidden md:block">{stat.change}</p>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-display">Recent Activity</h2>
            <Link to="/courses" className="text-sm text-brand-crimson hover:text-brand-crimson-dark font-medium">
              View All
            </Link>
          </div>
          {stats?.completedLessons > 0 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-green-600 mt-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Lessons Completed</p>
                  <p className="text-sm text-gray-600">You've completed {stats.completedLessons} lessons</p>
                  <p className="text-xs text-gray-500 mt-1">Keep up the great work!</p>
                </div>
              </div>
              {stats?.pendingPayments > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-amber-600 mt-1">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Payment Reminder</p>
                    <p className="text-sm text-gray-600">Pending amount: ${stats.pendingPayments}</p>
                    <p className="text-xs text-gray-500 mt-1">Please complete your payment</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <Link to="/courses" className="text-brand-crimson hover:text-brand-crimson-dark text-sm mt-2 inline-block">
                Start learning
              </Link>
            </div>
          )}
        </div>
        
        {/* Upcoming Lessons */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-display">Upcoming</h2>
            <Link to="/schedule" className="text-sm text-brand-crimson hover:text-brand-crimson-dark font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingLessons.length > 0 ? (
              upcomingLessons.map((lesson: any) => (
                <div key={lesson.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm">{lesson.moduleTitle}</p>
                  <p className="text-xs text-gray-600 mt-1">with {lesson.instructorName}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(lesson.scheduledDate).toLocaleDateString()}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{lesson.startTime} - {lesson.endTime}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No upcoming lessons</p>
              </div>
            )}
          </div>
          <Link
            to="/schedule"
            className="mt-4 w-full btn-outline justify-center"
          >
            <Calendar className="w-4 h-4" />
            Book New Lesson
          </Link>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-brand-crimson to-brand-royal rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2 font-display">Continue Learning</h2>
        <p className="text-blue-100 mb-6">Pick up where you left off in your courses</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-brand-crimson px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            <BookOpen className="w-5 h-5" />
            My Courses
          </Link>
          <Link to="/schedule" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
            <Calendar className="w-5 h-5" />
            Schedule Lesson
          </Link>
        </div>
      </div>
    </div>
  );
}