import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { useLessons, useCreateLesson, useUpdateLesson, useReorderLessons, type Lesson } from "@/frontend/hooks/use-lessons";
import { useModules } from "@/frontend/hooks/use-modules";
import { useLessonProgress } from "@/frontend/hooks/use-lesson-progress";
import { reorderPositions } from "@/backend/lib/position";
import { LessonViewer } from "@/frontend/components/LessonViewer";
import { ProgressButton } from "@/frontend/components/ProgressButton";
import { ArrowLeft, Plus, FileText, Video, BookOpen, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import type { LessonType, LessonContentType } from "@/backend/types/domain";

export const Route = createFileRoute("/_authenticated/courses/$courseId/modules/$moduleId")({
  component: ModuleDetail,
});

function ModuleDetail() {
  const { courseId, moduleId } = useParams({
    from: "/_authenticated/courses/$courseId/modules/$moduleId",
  });
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const isStudent = hasRole("student") && !isAdmin;

  // Fetch module info from the modules list
  const { data: modules = [], isLoading: modulesLoading } = useModules(courseId);
  const mod = modules.find((m) => m.id === moduleId) ?? null;

  // Fetch lessons via hook
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(moduleId);

  // For students: fetch lesson progress
  const { data: progressRecords = [] } = useLessonProgress(
    isStudent && user ? user.id : "",
    isStudent ? courseId : "",
  );

  const reorderLessons = useReorderLessons();

  const [filter, setFilter] = useState<"all" | LessonType>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  // For students: track selected lesson for LessonViewer
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const isLoading = modulesLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
        Module not found.
      </div>
    );
  }

  const filtered = lessons.filter((l) => filter === "all" || l.lesson_type === filter);

  const iconFor = (t: LessonContentType) =>
    t === "video" ? Video : t === "pdf" ? FileText : BookOpen;

  const isCompleted = (lessonId: string) =>
    progressRecords.some((p) => p.lesson_id === lessonId && p.completed);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = reorderPositions(lessons, index, index - 1);
    reorderLessons.mutate(
      { moduleId, items: reordered.map((l) => ({ id: l.id, position: l.position })) },
      { onError: (err) => toast.error(err.message) },
    );
  };

  const handleMoveDown = (index: number) => {
    if (index === lessons.length - 1) return;
    const reordered = reorderPositions(lessons, index, index + 1);
    reorderLessons.mutate(
      { moduleId, items: reordered.map((l) => ({ id: l.id, position: l.position })) },
      { onError: (err) => toast.error(err.message) },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        to="/courses/$courseId"
        params={{ courseId }}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>
      <div className="admin-card rounded-xl p-6">
        <h1 className="font-display text-3xl font-bold">{mod.title}</h1>
        {mod.description && <p className="mt-2 text-gray-500">{mod.description}</p>}
      </div>

      {/* Student: LessonViewer for selected lesson */}
      {isStudent && selectedLesson && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{selectedLesson.title}</h2>
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-sm text-gray-500 hover:text-foreground"
            >
              ✕ Close
            </button>
          </div>
          <LessonViewer lesson={selectedLesson} />
          {user && (
            <div className="flex justify-end">
              <ProgressButton
                lessonId={selectedLesson.id}
                userId={user.id}
                isCompleted={isCompleted(selectedLesson.id)}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="admin-card inline-flex rounded-xl p-1">
          {(["all", "theory", "practical"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-red-800 text-white"
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="btn-brand"
          >
            <Plus className="size-4" /> Add Lesson
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card rounded-xl p-8 text-center text-sm text-gray-500">
          No lessons yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((l, i) => {
            const Icon = iconFor(l.content_type as LessonContentType);
            const completed = isCompleted(l.id);
            return (
              <li
                key={l.id}
                className={`glass rounded-xl p-4 ${isStudent ? "cursor-pointer hover:bg-gray-50" : ""} ${
                  selectedLesson?.id === l.id ? "ring-2 ring-red-700" : ""
                }`}
                onClick={isStudent ? () => setSelectedLesson(l) : undefined}
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-800/20 text-red-800">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {i + 1}. {l.title}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                        style={{
                          background:
                            l.lesson_type === "theory"
                              ? "oklch(0.46 0.16 295 / 0.25)"
                              : "oklch(0.72 0.19 22 / 0.25)",
                        }}
                      >
                        {l.lesson_type}
                      </span>
                      {isStudent && completed && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    {l.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{l.body}</p>
                    )}
                    {l.content_url && !isStudent && (
                      <a
                        href={l.content_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-red-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open {l.content_type} →
                      </a>
                    )}
                  </div>
                  {/* Student: ProgressButton per lesson */}
                  {isStudent && user && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <ProgressButton
                        lessonId={l.id}
                        userId={user.id}
                        isCompleted={completed}
                      />
                    </div>
                  )}
                  {/* Admin: edit + reorder */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setEditing(l)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-foreground"
                        title="Edit lesson"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveUp(i)}
                          disabled={i === 0 || reorderLessons.isPending}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(i)}
                          disabled={i === lessons.length - 1 || reorderLessons.isPending}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="size-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(creating || editing) && (
        <LessonModal
          moduleId={moduleId}
          initial={editing ?? undefined}
          nextPosition={lessons.length}
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

function LessonModal({
  moduleId,
  initial,
  nextPosition,
  onClose,
  onSaved,
}: {
  moduleId: string;
  initial?: Lesson;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [contentUrl, setContentUrl] = useState(initial?.content_url ?? "");
  const [contentType, setContentType] = useState<LessonContentType>(
    (initial?.content_type as LessonContentType) ?? "text",
  );
  const [lessonType, setLessonType] = useState<LessonType>(
    (initial?.lesson_type as LessonType) ?? "theory",
  );

  const saving = createLesson.isPending || updateLesson.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      body: body || null,
      content_url: contentUrl || null,
      content_type: contentType,
      lesson_type: lessonType,
      module_id: moduleId,
    };

    if (initial) {
      updateLesson.mutate(
        { id: initial.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Lesson updated");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createLesson.mutate(
        { ...payload, position: nextPosition },
        {
          onSuccess: () => {
            toast.success("Lesson added");
            onSaved();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/50 px-4 py-6  overflow-y-auto">
      <div className="admin-card w-full max-w-md rounded-xl p-6">
        <h2 className="font-display text-xl font-bold">
          {initial ? "Edit lesson" : "New lesson"}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as LessonType)}
                className="form-input mt-1"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as LessonContentType)}
                className="form-input mt-1"
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
          {contentType !== "text" && (
            <div>
              <label className="text-sm font-medium">URL</label>
              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://…"
                className="form-input mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Body / notes</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
