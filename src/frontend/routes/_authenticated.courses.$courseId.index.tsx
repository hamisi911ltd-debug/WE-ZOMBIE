import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { useModules, useCreateModule, useUpdateModule, useReorderModules, type Module } from "@/frontend/hooks/use-modules";
import { useCourses } from "@/frontend/hooks/use-courses";
import { useEnrollments } from "@/frontend/hooks/use-enrollments";
import { checkCourseAccess } from "@/backend/lib/course-access";
import { reorderPositions } from "@/backend/lib/position";
import { ArrowLeft, Plus, BookOpen, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$courseId/")({
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = useParams({ from: "/_authenticated/courses/$courseId/" });
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const isStudent = hasRole("student") && !isAdmin;

  // Fetch course info from the courses list
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const course = courses.find((c) => c.id === courseId) ?? null;

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useModules(courseId);

  // For students: check enrollment access
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(
    isStudent && user ? user.id : undefined,
  );

  const reorderModules = useReorderModules();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);

  const isLoading = coursesLoading || modulesLoading || (isStudent && enrollmentsLoading);

  if (isLoading) {
    return (
      <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  // Student access check
  if (isStudent && user) {
    const hasAccess = checkCourseAccess(user.id, courseId, enrollments);
    if (!hasAccess) {
      return (
        <div className="space-y-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All courses
          </Link>
          <div className="admin-card rounded-xl p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-500">
              You are not enrolled in this course.
            </p>
          </div>
        </div>
      );
    }
  }

  if (!course) {
    return (
      <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
        Course not found.
      </div>
    );
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = reorderPositions(modules, index, index - 1);
    reorderModules.mutate(
      { courseId, items: reordered.map((m) => ({ id: m.id, position: m.position })) },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleMoveDown = (index: number) => {
    if (index === modules.length - 1) return;
    const reordered = reorderPositions(modules, index, index + 1);
    reorderModules.mutate(
      { courseId, items: reordered.map((m) => ({ id: m.id, position: m.position })) },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All courses
      </Link>
      <div className="admin-card rounded-xl p-6">
        {course.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-red-800">
            {course.category}
          </span>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="mt-2 text-gray-500">{course.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Modules</h2>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="btn-brand"
          >
            <Plus className="size-4" /> Add Module
          </button>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
          No modules yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {modules.map((m, i) => (
            <li key={m.id} className="admin-card flex items-center gap-4 rounded-xl p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-800/20 text-red-800 font-bold">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{m.title}</h3>
                {m.description && (
                  <p className="truncate text-sm text-gray-500">{m.description}</p>
                )}
              </div>
              <Link
                to="/courses/$courseId/modules/$moduleId"
                params={{ courseId, moduleId: m.id }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-red-800 hover:bg-gray-100"
              >
                <BookOpen className="size-4" /> Lessons
              </Link>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-foreground"
                    title="Edit module"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0 || reorderModules.isPending}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      disabled={i === modules.length - 1 || reorderModules.isPending}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <ModuleModal
          courseId={courseId}
          initial={editing ?? undefined}
          nextPosition={modules.length}
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

function ModuleModal({
  courseId,
  initial,
  nextPosition,
  onClose,
  onSaved,
}: {
  courseId: string;
  initial?: Module;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const saving = createModule.isPending || updateModule.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, description: description || null, course_id: courseId };

    if (initial) {
      updateModule.mutate(
        { id: initial.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Module updated");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createModule.mutate(
        { ...payload, position: nextPosition },
        {
          onSuccess: () => {
            toast.success("Module added");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/50 px-4 ">
      <div className="admin-card w-full max-w-md rounded-xl p-6">
        <h2 className="font-display text-xl font-bold">
          {initial ? "Edit module" : "New module"}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="btn-brand disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
