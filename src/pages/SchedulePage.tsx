import React from 'react';
import { useAuth } from '../lib/auth-context';
import { Calendar, Clock, User, MapPin, Plus } from 'lucide-react';

export default function SchedulePage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const isInstructor = hasRole('instructor');

  const lessons = [
    {
      id: 1,
      title: 'Practical Driving Session',
      date: '2024-01-15',
      time: '14:00',
      duration: '2 hours',
      instructor: 'Sarah Johnson',
      student: 'John Doe',
      location: 'Main Training Ground',
      status: 'scheduled',
    },
    {
      id: 2,
      title: 'Theory Class',
      date: '2024-01-16',
      time: '10:00',
      duration: '1 hour',
      instructor: 'Mike Wilson',
      student: 'Jane Smith',
      location: 'Classroom A',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Highway Driving Practice',
      date: '2024-01-17',
      time: '16:00',
      duration: '3 hours',
      instructor: 'Sarah Johnson',
      student: 'Bob Johnson',
      location: 'Highway Route 1',
      status: 'scheduled',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin || isInstructor ? 'Schedule Management' : 'My Schedule'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin || isInstructor 
              ? 'Manage lesson schedules and instructor assignments' 
              : 'View your upcoming lessons and training sessions'
            }
          </p>
        </div>
        {(isAdmin || isInstructor) && (
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Lesson
          </button>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">January 2024</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 6; // Adjust for calendar start
            const isCurrentMonth = day > 0 && day <= 31;
            const hasLesson = isCurrentMonth && [15, 16, 17].includes(day);
            
            return (
              <div
                key={i}
                className={`p-2 h-20 border border-gray-100 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${hasLesson ? 'bg-blue-50' : ''}`}
              >
                {isCurrentMonth && (
                  <>
                    <div className="text-sm font-medium text-gray-900">{day}</div>
                    {hasLesson && (
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Lessons</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lesson.status)}`}>
                      {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(lesson.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.time} ({lesson.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {isAdmin || isInstructor ? lesson.student : lesson.instructor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{lesson.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  {(isAdmin || isInstructor) && (
                    <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions for Students */}
      {!isAdmin && !isInstructor && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Reminders</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Please arrive 15 minutes before your scheduled lesson</li>
            <li>• Bring your learner's permit and any required documents</li>
            <li>• Contact your instructor if you need to reschedule</li>
            <li>• Wear comfortable clothing and closed-toe shoes</li>
          </ul>
        </div>
      )}
    </div>
  );
}