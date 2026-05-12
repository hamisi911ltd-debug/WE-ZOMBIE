import React from 'react';
import { useAuth } from '../lib/auth-context';
import { GraduationCap, Clock, Users, CheckCircle } from 'lucide-react';

export default function CoursesPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const isInstructor = hasRole('instructor');

  const courses = [
    {
      id: 1,
      title: 'Basic Driving Course',
      description: 'Learn the fundamentals of safe driving',
      duration: '4 weeks',
      students: 12,
      lessons: 16,
      progress: isAdmin ? null : 75,
    },
    {
      id: 2,
      title: 'Advanced Driving Skills',
      description: 'Master advanced driving techniques',
      duration: '6 weeks',
      students: 8,
      lessons: 24,
      progress: isAdmin ? null : 30,
    },
    {
      id: 3,
      title: 'Defensive Driving',
      description: 'Learn defensive driving strategies',
      duration: '3 weeks',
      students: 15,
      lessons: 12,
      progress: isAdmin ? null : 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin || isInstructor ? 'Course Management' : 'My Courses'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin || isInstructor 
              ? 'Manage driving courses and curriculum' 
              : 'Track your learning progress and access materials'
            }
          </p>
        </div>
        {(isAdmin || isInstructor) && (
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Add New Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
              </div>

              {!isAdmin && !isInstructor && course.progress !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                {isAdmin || isInstructor ? 'Manage Course' : 'Continue Learning'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isAdmin && !isInstructor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            If you have questions about your courses or need additional support, 
            contact your instructor or the school administration.
          </p>
        </div>
      )}
    </div>
  );
}