import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Save, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  tuition: number;
  pdl_fee: number;
  test_fee: number;
  total_fee: number;
  duration: string;
  archived: boolean;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    tuition: 0,
    pdl_fee: 0,
    test_fee: 0,
    duration: '',
  });
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  const loadCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include',
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = formData.tuition + formData.pdl_fee + formData.test_fee;
    const courseData = { ...formData, total_fee: total };
    
    try {
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse.id}`
        : '/api/admin/courses';
      
      const response = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) throw new Error('Failed to save course');
      
      toast.success(editingCourse ? 'Course updated!' : 'Course created!');
      setShowForm(false);
      setEditingCourse(null);
      resetForm();
      loadCourses();
    } catch (error) {
      toast.error('Failed to save course');
    }
  };
  
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      category: course.category,
      description: course.description || '',
      tuition: course.tuition,
      pdl_fee: course.pdl_fee,
      test_fee: course.test_fee,
      duration: course.duration || '',
    });
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this course?')) return;
    
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete course');
      
      toast.success('Course archived');
      loadCourses();
    } catch (error) {
      toast.error('Failed to archive course');
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      tuition: 0,
      pdl_fee: 0,
      test_fee: 0,
      duration: '',
    });
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    resetForm();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1e293b] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Courses Management</h1>
          <p className="text-gray-600 mt-2">Create and manage driving courses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-brand"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>
      
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.filter(c => !c.archived).map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 font-display">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Category: {course.category}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0 ml-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || 'No description'}</p>
            
            {/* Fees Breakdown */}
            <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tuition:</span>
                <span className="font-semibold">KES {course.tuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PDL:</span>
                <span className="font-semibold">KES {course.pdl_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Test:</span>
                <span className="font-semibold">KES {course.test_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-[#1e293b]">KES {course.total_fee.toLocaleString()}/=</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Duration:</span> {course.duration || 'Not set'}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to={`/admin/courses/${course.id}/modules`}
                className="btn-outline flex-1 justify-center text-sm"
              >
                <Eye className="w-4 h-4" />
                Modules
              </Link>
              <button
                onClick={() => handleEdit(course)}
                className="btn-outline"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600 border border-gray-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {courses.filter(c => !c.archived).length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-brand">
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      )}
      
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 font-display">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Class B - Light Private Vehicle"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    placeholder="e.g., B"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 6 weeks"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    rows={3}
                    placeholder="Course description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuition Fee (KES) *
                  </label>
                  <input
                    type="number"
                    value={formData.tuition}
                    onChange={(e) => setFormData({ ...formData, tuition: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDL Fee (KES) *
                  </label>
                  <input
                    type="number"
                    value={formData.pdl_fee}
                    onChange={(e) => setFormData({ ...formData, pdl_fee: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Fee (KES) *
                  </label>
                  <input
                    type="number"
                    value={formData.test_fee}
                    onChange={(e) => setFormData({ ...formData, test_fee: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fee (Auto-calculated)
                  </label>
                  <input
                    type="text"
                    value={`KES ${(formData.tuition + formData.pdl_fee + formData.test_fee).toLocaleString()}/=`}
                    className="form-input bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1 justify-center">
                  <Save className="w-4 h-4" />
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
