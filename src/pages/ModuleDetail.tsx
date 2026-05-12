import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  Download,
  BookOpen,
  Clock,
} from 'lucide-react';
import { modulesAPI, lessonProgressAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ModuleDetail() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (courseId && moduleId) {
      loadModuleDetail();
    }
  }, [courseId, moduleId]);
  
  const loadModuleDetail = async () => {
    try {
      const result = await modulesAPI.getById(courseId!, moduleId!);
      setData(result);
      
      // Find first incomplete lesson
      const firstIncomplete = result.lessons.findIndex((l: any) => !l.completed);
      if (firstIncomplete !== -1) {
        setCurrentLessonIndex(firstIncomplete);
      }
    } catch (error) {
      console.error('Failed to load module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }
  
  if (!data || !data.lessons || data.lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Module not found or no lessons available</h3>
        <Link to={`/courses/${courseId}`} className="text-brand-crimson hover:text-brand-crimson-dark">
          Back to course
        </Link>
      </div>
    );
  }
  
  const { module, course, lessons } = data;
  const currentLesson = lessons[currentLessonIndex];
  const progress = Math.round((lessons.filter((l: any) => l.completed).length / lessons.length) * 100);
  
  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };
  
  const handleMarkComplete = async () => {
    try {
      await lessonProgressAPI.update(currentLesson.id, true);
      
      // Update local state
      const updatedLessons = [...lessons];
      updatedLessons[currentLessonIndex].completed = true;
      setData({ ...data, lessons: updatedLessons });
      
      toast.success('Lesson marked as complete!');
      
      // Move to next lesson
      if (currentLessonIndex < lessons.length - 1) {
        handleNext();
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('Failed to update progress');
    }
  };
  
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {course.title}
      </button>
      
      {/* Module Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          {module.title}
        </h1>
        <p className="text-gray-600 mb-4">{module.description || 'No description'}</p>
        
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Module Progress</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {lessons.filter((l: any) => l.completed).length} of {lessons.length} lessons completed
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Lesson */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Lesson Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Lesson {currentLessonIndex + 1} of {lessons.length}
                    </span>
                    {currentLesson.completed && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">
                    {currentLesson.title}
                  </h2>
                </div>
              </div>
            </div>
            
            {/* Lesson Content Area */}
            <div className="p-6">
              {currentLesson.contentType === 'video' ? (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Video Player</p>
                    {currentLesson.contentUrl && (
                      <a 
                        href={currentLesson.contentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs opacity-75 hover:opacity-100 underline mt-2 inline-block"
                      >
                        Open video
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {currentLesson.body || 'No content available'}
                    </div>
                    {currentLesson.contentUrl && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <a 
                          href={currentLesson.contentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-brand-crimson hover:text-brand-crimson-dark"
                        >
                          <Download className="w-4 h-4" />
                          Download resource
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Lesson Type Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentLesson.lessonType === 'practical' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {currentLesson.lessonType === 'practical' ? 'Practical' : 'Theory'}
                </span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex === 0}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                {!currentLesson.completed && (
                  <button
                    onClick={handleMarkComplete}
                    className="btn-brand"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={currentLessonIndex === lessons.length - 1}
                  className="btn-brand disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lessons Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 font-display">Lessons</h3>
            <div className="space-y-2">
              {lessons.map((lesson: any, index: number) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    index === currentLessonIndex
                      ? 'border-brand-crimson bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      lesson.completed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        getLessonIcon(lesson.contentType)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        index === currentLessonIndex ? 'text-brand-crimson' : 'text-gray-900'
                      }`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{lesson.contentType}</span>
                        {lesson.completed && (
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
