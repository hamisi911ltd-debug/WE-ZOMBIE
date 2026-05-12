import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  FileText,
  Award,
} from 'lucide-react';
import { coursesAPI } from '@/lib/api-client';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);
  
  const loadCourseDetail = async () => {
    try {
      const result = await coursesAPI.getById(courseId!);
      setData(result);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h3>
        <Link to="/courses" className="text-brand-crimson hover:text-brand-crimson-dark">
          Back to courses
        </Link>
      </div>
    );
  }
  
  const { course, modules } = data;
  const totalModules = modules.length;
  const completedModules = modules.filter((m: any) => m.status === 'completed').length;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            In Progress
          </span>
        );
      case 'locked':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Locked
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>
      
      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-500 h-2"></div>
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">{course.description || 'No description available'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalModules} modules</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">{progress}%</span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedModules} of {totalModules} modules completed
            </p>
          </div>
        </div>
      </div>
      
      {/* Modules List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">Course Modules</h2>
        {modules.length > 0 ? (
          <div className="space-y-4">
            {modules.map((module: any, index: number) => (
              <div
                key={module.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
                  module.status === 'locked' ? 'opacity-60' : 'hover:shadow-lg'
                } transition-all`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Module Number */}
                    <div className={`w-12 h-12 rounded-lg ${
                      module.status === 'completed' ? 'bg-green-500' :
                      module.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    } flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    
                    {/* Module Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 font-display mb-1">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-600">{module.description || 'No description'}</p>
                        </div>
                        {getStatusBadge(module.status)}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{module.lessons || 0} lessons</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar for in-progress modules */}
                      {module.status === 'in-progress' && module.progress > 0 && (
                        <div className="mt-4">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${module.progress}%` }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{module.progress}% complete</p>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <div className="mt-4">
                        {module.status === 'locked' ? (
                          <button disabled className="btn-outline opacity-50 cursor-not-allowed">
                            <Lock className="w-4 h-4" />
                            Locked
                          </button>
                        ) : module.status === 'completed' ? (
                          <Link
                            to={`/courses/${courseId}/modules/${module.id}`}
                            className="btn-outline"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Review Module
                          </Link>
                        ) : (
                          <Link
                            to={`/courses/${courseId}/modules/${module.id}`}
                            className="btn-brand"
                          >
                            <Play className="w-4 h-4" />
                            {module.progress > 0 ? 'Continue Learning' : 'Start Module'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600">Modules will be added soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
