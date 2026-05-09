import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Plus, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$courseId/")({
  component: CourseDetail,
});

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
}
interface Module {
  id: string;
  title: string;
  description: string | null;
  position: number;
}

function CourseDetail() {
  const { courseId } = useParams({ from: "/_authenticated/courses/$courseId" });
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);

  const load = async () => {
    const [{ data: c }, { data: m }] = await Promise.all([
      supabase.from("courses").select("id,title,description,category").eq("id", courseId).single(),
      supabase
        .from("modules")
        .select("id,title,description,position")
        .eq("course_id", courseId)
        .order("position"),
    ]);
    setCourse((c as Course) ?? null);
    setModules((m ?? []) as Module[]);
  };

  useEffect(() => {
    load();
  }, [courseId]);

  if (!course) {
    return <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All courses
      </Link>
      <div className="glass-strong rounded-3xl p-6">
        {course.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {course.category}
          </span>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="mt-2 text-muted-foreground">{course.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Modules</h2>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow"
          >
            <Plus className="size-4" /> Add Module
          </button>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No modules yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {modules.map((m, i) => (
            <li key={m.id} className="glass flex items-center gap-4 rounded-2xl p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/20 text-primary font-bold">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{m.title}</h3>
                {m.description && (
                  <p className="truncate text-sm text-muted-foreground">{m.description}</p>
                )}
              </div>
              <Link
                to="/courses/$courseId/modules/$moduleId"
                params={{ courseId, moduleId: m.id }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-white/10"
              >
                <BookOpen className="size-4" /> Lessons
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setEditing(m)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
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
            load();
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title, description: description || null, course_id: courseId };
    const op = initial
      ? supabase.from("modules").update(payload).eq("id", initial.id)
      : supabase.from("modules").insert({ ...payload, position: nextPosition });
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Module updated" : "Module added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 backdrop-blur-md">
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold">{initial ? "Edit module" : "New module"}</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
