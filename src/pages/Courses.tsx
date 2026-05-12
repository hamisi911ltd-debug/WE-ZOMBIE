import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/backend/lib/auth-context';
import { coursesAPI } from '@/lib/api-client';

export default function Courses() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }
  
  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => !c.enrolled);
  
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">My Courses</h1>
          <p className="text-gray-600 mt-2">Track your progress and continue learning</p>
        </div>
        {isAdmin && (
          <button className="btn-brand">
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        )}
      </div>
      
      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Enrolled Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course, index) => {
              const color = colors[index % colors.length];
              return (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`${color} h-2`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 font-display">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description || 'No description'}</p>
                      </div>
                      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-4`}>
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {course.completedModules} of {course.totalModules} modules completed
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="btn-brand w-full justify-center"
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, index) => {
              const color = colors[(index + enrolledCourses.length) % colors.length];
              return (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description || 'No description'}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.totalModules || 0} modules</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button className="btn-outline w-full justify-center">
                      Enroll Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {courses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-600">Check back later for new courses</p>
        </div>
      )}
    </div>
  );
}
