import React from 'react';
import { useAuth } from '../lib/auth-context';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, roles, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const isInstructor = hasRole('instructor');

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    trend?: string; 
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    href, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    description: string; 
    href: string; 
    icon: any; 
    color: string; 
  }) => (
    <Link
      to={href}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </Link>
  );

  if (isAdmin || isInstructor) {
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.fullName || user?.email}
          </h1>
          <p className="text-red-100 mt-2">
            {isAdmin ? 'Admin Dashboard' : 'Instructor Dashboard'} - Manage your driving school operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value="24"
            icon={Users}
            color="bg-blue-500"
            trend="+3 this week"
          />
          <StatCard
            title="Active Courses"
            value="6"
            icon={GraduationCap}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Payments"
            value="8"
            icon={CreditCard}
            color="bg-yellow-500"
          />
          <StatCard
            title="This Week's Lessons"
            value="32"
            icon={Calendar}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Manage Students"
              description="View, add, and manage student enrollments"
              href="/students"
              icon={Users}
              color="bg-blue-500"
            />
            <QuickActionCard
              title="Course Management"
              description="Create and edit driving courses"
              href="/courses"
              icon={GraduationCap}
              color="bg-green-500"
            />
            <QuickActionCard
              title="Payment Tracking"
              description="Monitor payments and generate receipts"
              href="/payments"
              icon={CreditCard}
              color="bg-yellow-500"
            />
            <QuickActionCard
              title="Schedule Lessons"
              description="Manage lesson schedules and bookings"
              href="/schedule"
              icon={Calendar}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                  <p className="text-xs text-gray-500">John Doe joined Basic Driving Course</p>
                </div>
                <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">KES 15,000 from Jane Smith</p>
                </div>
                <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lesson scheduled</p>
                  <p className="text-xs text-gray-500">Practical lesson for Mike Johnson</p>
                </div>
                <span className="text-xs text-gray-400 ml-auto">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.fullName || user?.email}
        </h1>
        <p className="text-red-100 mt-2">
          Track your driving course progress and manage your learning journey
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Course Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-medium">8/12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
            <p className="text-sm text-gray-600">67% Complete</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Next Lesson</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">Tomorrow, 2:00 PM</p>
            <p className="text-sm text-gray-600">Practical Driving Session</p>
            <p className="text-sm text-gray-500">Instructor: Sarah Johnson</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Portal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="My Courses"
            description="View course materials and progress"
            href="/courses"
            icon={GraduationCap}
            color="bg-green-500"
          />
          <QuickActionCard
            title="Payment History"
            description="View payments and download receipts"
            href="/payments"
            icon={CreditCard}
            color="bg-yellow-500"
          />
          <QuickActionCard
            title="My Schedule"
            description="View upcoming lessons and bookings"
            href="/schedule"
            icon={Calendar}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Schedule Update</p>
                <p className="text-xs text-gray-600 mt-1">
                  Please note that all practical lessons next week will start 30 minutes earlier due to road maintenance.
                </p>
                <span className="text-xs text-gray-400">Posted 2 days ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New Study Materials</p>
                <p className="text-xs text-gray-600 mt-1">
                  Updated highway code materials are now available in your course section.
                </p>
                <span className="text-xs text-gray-400">Posted 1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}