import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Plus, GraduationCap, Pencil, Archive } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/")({
  component: CoursesPage,
});

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  archived: boolean;
}

function CoursesPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id,title,description,category,archived")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setCourses((data ?? []) as Course[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Create courses and structure them into modules and lessons."
              : "Browse the curriculum."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground glow"
          >
            <Plus className="size-4" /> New Course
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : courses.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <GraduationCap className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 font-display text-xl font-semibold">No courses yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Create your first course to get started." : "Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="glass group flex flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {c.category && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {c.category}
                    </span>
                  )}
                  <h3 className="mt-1 font-display text-lg font-semibold">{c.title}</h3>
                </div>
                {c.archived && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Archived</span>
                )}
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {c.description ?? "No description."}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: c.id }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Open →
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => setEditing(c)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                )}
              </div>
            </div>
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
            load();
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [archived, setArchived] = useState(initial?.archived ?? false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title, category: category || null, description: description || null, archived };
    const op = initial
      ? supabase.from("courses").update(payload).eq("id", initial.id)
      : supabase.from("courses").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Course updated" : "Course created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 backdrop-blur-md">
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold">
          {initial ? "Edit course" : "New course"}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Category B – Light Private"
              className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Class B"
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
          {initial && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
              />
              <Archive className="size-4" /> Archived
            </label>
          )}
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
