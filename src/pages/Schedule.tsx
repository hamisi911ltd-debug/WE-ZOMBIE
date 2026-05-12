import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/backend/lib/auth-context';
import { scheduleAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function Schedule() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSchedule();
  }, []);
  
  const loadSchedule = async () => {
    try {
      const data = await scheduleAPI.getAll();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }
  
  // Filter upcoming lessons
  const now = new Date();
  const upcomingLessons = schedule.filter(entry => new Date(entry.scheduledDate) >= now);
  
  const getStatusBadge = (entry: any) => {
    const lessonDate = new Date(entry.scheduledDate);
    if (lessonDate < now) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Confirmed
        </span>
    );
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Schedule</h1>
          <p className="text-gray-600 mt-2">Book and manage your driving lessons</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="btn-brand"
        >
          <Plus className="w-4 h-4" />
          Book Lesson
        </button>
      </div>
      
      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-display">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Simple calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const hasLesson = schedule.some(entry => {
                const entryDate = new Date(entry.scheduledDate);
                return entryDate.getDate() === day && 
                       entryDate.getMonth() === selectedDate.getMonth() &&
                       entryDate.getFullYear() === selectedDate.getFullYear();
              });
              const isToday = day === new Date().getDate() && 
                             selectedDate.getMonth() === new Date().getMonth() &&
                             selectedDate.getFullYear() === new Date().getFullYear();
              return (
                <button
                  key={i}
                  className={`aspect-square p-2 rounded-lg text-sm ${
                    day < 1 || day > 31
                      ? 'text-gray-300'
                      : hasLesson
                      ? 'bg-brand-crimson text-white font-semibold'
                      : isToday
                      ? 'bg-gray-100 font-semibold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {day > 0 && day <= 31 ? day : ''}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-2xl font-bold text-blue-900">{upcomingLessons.length}</p>
              <p className="text-sm text-blue-700">Upcoming Lessons</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-2xl font-bold text-green-900">{schedule.length - upcomingLessons.length}</p>
              <p className="text-sm text-green-700">Completed Lessons</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 font-display">
            {upcomingLessons.length > 0 ? 'Upcoming Lessons' : 'No Upcoming Lessons'}
          </h2>
        </div>
        {upcomingLessons.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{lesson.moduleTitle}</h3>
                      {getStatusBadge(lesson)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{lesson.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(lesson.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{lesson.startTime} - {lesson.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No upcoming lessons scheduled</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="mt-4 text-brand-crimson hover:text-brand-crimson-dark font-medium"
            >
              Book your first lesson
            </button>
          </div>
        )}
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-display">Book a Lesson</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              toast.info('Booking functionality will be implemented with instructor data');
              setShowBookingForm(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input type="date" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input type="time" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input type="time" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea className="form-input" rows={3} placeholder="Any special requirements..."></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1 justify-center">
                  Book Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
