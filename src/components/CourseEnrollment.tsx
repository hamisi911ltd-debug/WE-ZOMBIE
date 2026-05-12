import { useState, useEffect } from 'react';
import { GraduationCap, Plus, X, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { coursesAPI, enrollmentsAPI } from '@/lib/api-client';

interface Course {
  id: string;
  title: string;
  description: string;
  fee: number;
  duration: string;
  category: string;
}

interface CourseEnrollmentProps {
  studentId?: string;
  onEnrollmentComplete?: () => void;
}

export default function CourseEnrollment({ studentId, onEnrollmentComplete }: CourseEnrollmentProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !studentId) return;
    
    setEnrolling(true);
    try {
      await enrollmentsAPI.create({
        studentId,
        courseId: selectedCourse.id,
        enrollmentDate: new Date().toISOString(),
        status: 'active'
      });
      
      toast.success(`Successfully enrolled in ${selectedCourse.title}`);
      setShowModal(false);
      setSelectedCourse(null);
      onEnrollmentComplete?.();
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-crimson to-brand-royal rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{course.category}</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-brand-crimson">
                <span>KES</span>
                <span>{course.fee.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedCourse(course);
                setShowModal(true);
              }}
              className="w-full btn-brand text-xs py-2"
            >
              <Plus className="w-3 h-3" />
              Enroll
            </button>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Enrollment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-crimson to-brand-royal rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedCourse.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedCourse.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <span>KES {selectedCourse.fee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Enrollment Details</p>
                    <p className="text-blue-700 mt-1">
                      You will be enrolled in this course immediately. Payment can be made later through the admin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-outline justify-center"
                disabled={enrolling}
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex-1 btn-brand justify-center"
              >
                {enrolling ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Enrollment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}