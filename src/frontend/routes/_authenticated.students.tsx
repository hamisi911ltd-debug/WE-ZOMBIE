import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { useStudents, useUpdateProfile } from "@/frontend/hooks/use-students";
import { useEnrollments, useUpdateEnrollment } from "@/frontend/hooks/use-enrollments";
import { useCourses } from "@/frontend/hooks/use-courses";
import { EnrollStudentForm } from "@/frontend/components/EnrollStudentForm";
import { StudentDetail } from "@/frontend/components/StudentDetail";
import { Users, Search, ShieldOff, UserPlus, Pencil, UserMinus, X, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  if (!isAdmin) {
    return (
      <div className="admin-card p-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "#fee2e2" }}>
          <ShieldOff className="size-7" style={{ color: "#b91c1c" }} />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mx-auto mt-2 max-w-md text-gray-500">
          This section is for administrators only.
        </p>
      </div>
    );
  }

  return <StudentsContent />;
}

function StudentsContent() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Edit state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const filter = {
    courseId: courseFilter || undefined,
    status: statusFilter || undefined,
  };

  const { data: students = [], isLoading: studentsLoading } = useStudents(search, filter);
  const { data: enrollments = [] } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const updateProfile = useUpdateProfile();
  const updateEnrollment = useUpdateEnrollment();

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Map student id → their latest active enrollment (keep most recent)
  const enrollmentByStudent = new Map<
    string,
    { id: string; courseId: string; status: string }
  >();
  for (const e of enrollments) {
    const existing = enrollmentByStudent.get(e.user_id);
    if (!existing || e.status === "active") {
      enrollmentByStudent.set(e.user_id, {
        id: e.id,
        courseId: e.course_id,
        status: e.status,
      });
    }
  }

  const startEdit = (student: { id: string; full_name: string | null; phone?: string | null }) => {
    setEditingStudentId(student.id);
    setEditName(student.full_name ?? "");
    setEditPhone((student as any).phone ?? "");
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setEditName("");
    setEditPhone("");
  };

  const saveEdit = (studentId: string) => {
    updateProfile.mutate(
      { id: studentId, full_name: editName || undefined, phone: editPhone || undefined },
      {
        onSuccess: () => {
          toast.success("Student updated");
          cancelEdit();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleUnenroll = (enrollmentId: string) => {
    updateEnrollment.mutate(
      { id: enrollmentId, status: "withdrawn" },
      {
        onSuccess: () => toast.success("Student unenrolled"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="section-subtitle">Manage student enrollments and profiles.</p>
        </div>
        <button onClick={() => setEnrollOpen(true)} className="btn-brand">
          <UserPlus className="size-4" /> Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="form-input w-auto">
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-auto">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Table */}
      {studentsLoading ? (
        <div className="admin-card p-8 text-center text-sm text-gray-500">Loading…</div>
      ) : students.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <Users className="mx-auto size-10 text-gray-300 mb-3" />
          <h2 className="font-display text-xl font-bold text-gray-900">No students found</h2>
          <p className="mt-1 text-sm text-gray-500">
            {search || courseFilter || statusFilter ? "Try adjusting your search or filters." : "Enroll your first student to get started."}
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Enrolled Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const enrollment = enrollmentByStudent.get(student.id);
                const course = enrollment ? courseMap.get(enrollment.courseId) : undefined;
                const isEditing = editingStudentId === student.id;

                return (
                  <tr key={student.id}>
                    <td className="font-medium">
                      {isEditing ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="form-input py-1" autoFocus />
                      ) : (
                        <button onClick={() => setSelectedStudentId(student.id)} className="text-left font-semibold hover:underline" style={{ color: "#8b1a1a" }}>
                          {student.full_name ?? "—"}
                        </button>
                      )}
                    </td>
                    <td className="text-gray-500">
                      {isEditing ? (
                        <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className="form-input py-1" />
                      ) : (
                        <span className="text-sm">{(student as any).phone ?? <span className="text-gray-400 font-mono text-xs">{student.id.slice(0, 8)}…</span>}</span>
                      )}
                    </td>
                    <td>
                      {course ? (
                        <span className="badge badge-blue">{course.title}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td>
                      {enrollment ? (
                        <span className={`badge ${enrollment.status === "active" ? "badge-green" : enrollment.status === "completed" ? "badge-blue" : "badge-red"}`}>
                          {enrollment.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not enrolled</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(student.id)} disabled={updateProfile.isPending} className="rounded p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"><Check className="size-4" /></button>
                            <button onClick={cancelEdit} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><X className="size-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(student)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Edit"><Pencil className="size-4" /></button>
                            {enrollment && enrollment.status === "active" && (
                              <button onClick={() => handleUnenroll(enrollment.id)} disabled={updateEnrollment.isPending} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50" title="Unenroll"><UserMinus className="size-4" /></button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EnrollStudentForm open={enrollOpen} onOpenChange={setEnrollOpen} />
      {selectedStudentId && (
        <StudentDetail
          studentId={selectedStudentId}
          open={!!selectedStudentId}
          onOpenChange={(o) => { if (!o) setSelectedStudentId(null); }}
        />
      )}
    </div>
  );
}

