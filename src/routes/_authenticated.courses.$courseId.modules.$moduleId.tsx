import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Plus, FileText, Video, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$courseId/modules/$moduleId")({
  component: ModuleDetail,
});

type LessonType = "theory" | "practical";
type ContentType = "text" | "video" | "pdf";

interface Module {
  id: string;
  title: string;
  description: string | null;
}
interface Lesson {
  id: string;
  title: string;
  body: string | null;
  content_url: string | null;
  content_type: ContentType;
  lesson_type: LessonType;
  position: number;
}

function ModuleDetail() {
  const { courseId, moduleId } = useParams({
    from: "/_authenticated/courses/$courseId/modules/$moduleId",
  });
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [mod, setMod] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filter, setFilter] = useState<"all" | LessonType>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const load = async () => {
    const [{ data: m }, { data: l }] = await Promise.all([
      supabase.from("modules").select("id,title,description").eq("id", moduleId).single(),
      supabase
        .from("lessons")
        .select("id,title,body,content_url,content_type,lesson_type,position")
        .eq("module_id", moduleId)
        .order("position"),
    ]);
    setMod((m as Module) ?? null);
    setLessons((l ?? []) as Lesson[]);
  };

  useEffect(() => {
    load();
  }, [moduleId]);

  if (!mod) {
    return <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  const filtered = lessons.filter((l) => filter === "all" || l.lesson_type === filter);
  const iconFor = (t: ContentType) => (t === "video" ? Video : t === "pdf" ? FileText : BookOpen);

  return (
    <div className="space-y-6">
      <Link
        to="/courses/$courseId"
        params={{ courseId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>
      <div className="glass-strong rounded-3xl p-6">
        <h1 className="font-display text-3xl font-bold">{mod.title}</h1>
        {mod.description && <p className="mt-2 text-muted-foreground">{mod.description}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass inline-flex rounded-xl p-1">
          {(["all", "theory", "practical"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                filter === f ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow"
          >
            <Plus className="size-4" /> Add Lesson
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No lessons yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((l, i) => {
            const Icon = iconFor(l.content_type);
            return (
              <li key={l.id} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/20 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {i + 1}. {l.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          l.lesson_type === "theory"
                            ? "bg-violet/20 text-foreground"
                            : "bg-coral/20 text-foreground"
                        }`}
                        style={{
                          background:
                            l.lesson_type === "theory"
                              ? "oklch(0.46 0.16 295 / 0.25)"
                              : "oklch(0.72 0.19 22 / 0.25)",
                        }}
                      >
                        {l.lesson_type}
                      </span>
                    </div>
                    {l.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.body}</p>
                    )}
                    {l.content_url && (
                      <a
                        href={l.content_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                      >
                        Open {l.content_type} →
                      </a>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditing(l)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
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
            load();
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [contentUrl, setContentUrl] = useState(initial?.content_url ?? "");
  const [contentType, setContentType] = useState<ContentType>(initial?.content_type ?? "text");
  const [lessonType, setLessonType] = useState<LessonType>(initial?.lesson_type ?? "theory");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      body: body || null,
      content_url: contentUrl || null,
      content_type: contentType,
      lesson_type: lessonType,
      module_id: moduleId,
    };
    const op = initial
      ? supabase.from("lessons").update(payload).eq("id", initial.id)
      : supabase.from("lessons").insert({ ...payload, position: nextPosition });
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Lesson updated" : "Lesson added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-6 backdrop-blur-md overflow-y-auto">
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold">{initial ? "Edit lesson" : "New lesson"}</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as LessonType)}
                className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
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
                className="mt-1 w-full rounded-xl border border-input bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Body / notes</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
