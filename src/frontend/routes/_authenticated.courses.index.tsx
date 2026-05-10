import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useArchiveCourse,
  type Course,
} from "@/frontend/hooks/use-courses";
import { Plus, GraduationCap, Pencil, Archive, Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/backend/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/courses/")({
  component: CoursesPage,
});

// Category color coding: theory = crimson, practical = royal blue, default = navy
function getCategoryStyle(category: string | null): { bg: string; text: string } {
  if (!category) return { bg: "rgba(26,39,68,0.40)", text: "#94a3b8" };
  const lower = category.toLowerCase();
  if (lower.includes("theory") || lower.includes("class b") || lower.includes("b")) {
    return { bg: "rgba(139,26,26,0.20)", text: "#f87171" };
  }
  if (lower.includes("practical") || lower.includes("class c") || lower.includes("c")) {
    return { bg: "rgba(30,58,138,0.20)", text: "#60a5fa" };
  }
  return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" };
}

function CourseCard({
  course,
  isAdmin,
  onEdit,
  onArchive,
  onDelete,
  onView,
}: {
  course: Course;
  isAdmin: boolean;
  onEdit: (c: Course) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  const catStyle = getCategoryStyle(course.category);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="admin-card-hover group flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {course.category && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
            >
              {course.category}
            </span>
          )}
          <h3 className="mt-2 font-display text-base font-bold text-gray-900 leading-tight">{course.title}</h3>
        </div>
        {course.archived && (
          <span className="badge badge-gray shrink-0">Archived</span>
        )}
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">
        {course.description ?? "No description."}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          onClick={() => onView(course.id)}
          className="inline-flex items-center gap-1 text-sm font-semibold transition"
          style={{ color: "#8b1a1a" }}
        >
          <Eye className="size-4" /> View
        </button>
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(course)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" title="Edit">
              <Pencil className="size-4" />
            </button>
            {!course.archived && (
              <button onClick={() => onArchive(course.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" title="Archive">
                <Archive className="size-4" />
              </button>
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button onClick={() => { onDelete(course.id); setConfirmDelete(false); }} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Yes</button>
                <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">No</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const navigate = useNavigate();

  const { data: courses = [], isLoading } = useCourses();
  const archiveCourse = useArchiveCourse();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleArchive = (courseId: string) => {
    archiveCourse.mutate(courseId, {
      onSuccess: () => toast.success("Course archived"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = async (courseId: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Course deleted");
      // Invalidate via archive hook's queryClient (reuse pattern)
      archiveCourse.reset();
    }
  };

  // Unique categories for filter dropdown
  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean) as string[])
  );

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Courses</h1>
          <p className="section-subtitle">
            {isAdmin ? "Create and manage your driving school curriculum." : "Browse your enrolled courses."}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setCreating(true)} className="btn-brand">
            <Plus className="size-4" /> New Course
          </button>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="admin-card p-8 text-center text-sm text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <GraduationCap className="mx-auto size-10 text-gray-300 mb-3" />
          <h2 className="font-display text-xl font-bold text-gray-900">
            {isAdmin ? "No courses yet" : "No courses enrolled"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {search || categoryFilter ? "Try adjusting your search or filters." : isAdmin ? "Create your first course to get started." : "You are not enrolled in any courses yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              isAdmin={isAdmin}
              onEdit={setEditing}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onView={(id) => navigate({ to: "/courses/$courseId", params: { courseId: id } })}
            />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <CourseModal
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CourseModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Course;
  onClose: () => void;
  onSaved: () => void;
}) {
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const saving = createCourse.isPending || updateCourse.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      category: category || null,
      description: description || null,
    };

    if (initial) {
      updateCourse.mutate(
        { id: initial.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Course updated");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCourse.mutate(
        { ...payload, archived: false },
        {
          onSuccess: () => {
            toast.success("Course created");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="font-display text-xl font-bold text-gray-900">
          {initial ? "Edit Course" : "New Course"}
        </h2>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Category B – Light Private" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Theory / Practical / Class B" className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-brand">
              {saving ? "Saving…" : "Save Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
