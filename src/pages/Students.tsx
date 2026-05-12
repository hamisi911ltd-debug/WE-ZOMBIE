import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  X,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import { useAuth } from '@/backend/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { studentsAPI } from '@/lib/api-client';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
  enrolledDate: string;
  courses: string[];
  progress: number;
  status: string;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export default function Students() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);
  
  const loadStudents = async () => {
    try {
      const data = await studentsAPI.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }
  
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.idNumber && student.idNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Completed
          </span>
        );
      case 'inactive':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };
  
  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await studentsAPI.create({
        email: formData.get('email') as string,
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        idNumber: formData.get('idNumber') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        address: formData.get('address') as string,
        courseId: formData.get('courseId') as string || undefined,
      });
      
      toast.success('Student added successfully');
      setShowAddForm(false);
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add student');
    }
  };
  
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };
  
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };
  
  const handleUpdateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await studentsAPI.update(selectedStudent.id, {
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        idNumber: formData.get('idNumber') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        address: formData.get('address') as string,
      });
      
      toast.success('Student updated successfully');
      setShowEditModal(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student');
    }
  };
  
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await studentsAPI.delete(studentId);
      toast.success('Student deleted successfully');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Students</h1>
          <p className="text-gray-600 mt-2">Manage student enrollments and progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-brand"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 font-display">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {students.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, email, or ID number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>
      
      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{student.idNumber || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {student.courses.length > 0 ? (
                          student.courses.map((course: string, idx: number) => (
                            <p key={idx} className="text-sm text-gray-900">{course}</p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No courses</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewStudent(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditStudent(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No students found</p>
          </div>
        )}
      </div>
      
      {/* Add Student Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Add New Student</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleAddStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input type="text" name="fullName" className="form-input" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number *
                  </label>
                  <input type="text" name="idNumber" className="form-input" placeholder="12345678" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input type="email" name="email" className="form-input" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input type="tel" name="phone" className="form-input" placeholder="+254 712 345 678" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input type="date" name="dateOfBirth" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enroll in Course
                  </label>
                  <select name="courseId" className="form-input">
                    <option value="">Select a course (optional)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea name="address" className="form-input" rows={2} placeholder="Full address"></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1 justify-center">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 font-display">Student Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{selectedStudent.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    ID Number
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{selectedStudent.idNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{selectedStudent.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{selectedStudent.phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900 font-medium mt-1">
                    {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Enrolled Date
                  </label>
                  <p className="text-gray-900 font-medium mt-1">
                    {new Date(selectedStudent.enrolledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <p className="text-gray-900 font-medium mt-1">{selectedStudent.address || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Enrolled Courses
                </label>
                {selectedStudent.courses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.courses.map((course, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-900 font-medium">{course}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No courses enrolled</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                {getStatusBadge(selectedStudent.status)}
              </div>
            </div>
            
            <div className="flex gap-3 pt-6 mt-6 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditStudent(selectedStudent);
                }}
                className="btn-brand flex-1 justify-center"
              >
                <Edit className="w-4 h-4" />
                Edit Student
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-outline flex-1 justify-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Edit Student</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdateStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    name="fullName" 
                    className="form-input" 
                    defaultValue={selectedStudent.name}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input 
                    type="text" 
                    name="idNumber" 
                    className="form-input" 
                    defaultValue={selectedStudent.idNumber || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-input" 
                    defaultValue={selectedStudent.phone}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    className="form-input" 
                    defaultValue={selectedStudent.dateOfBirth || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea 
                  name="address" 
                  className="form-input" 
                  rows={2}
                  defaultValue={selectedStudent.address || ''}
                ></textarea>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedStudent.email} (cannot be changed)
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1 justify-center">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
