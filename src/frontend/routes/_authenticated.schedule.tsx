import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Pencil, User, Trash2 } from "lucide-react";
import { useAuth } from "@/backend/lib/auth-context";
import { useScheduleEntries, useDeleteScheduleEntry } from "@/frontend/hooks/use-schedule";
import { ScheduleEntryForm } from "@/frontend/components/ScheduleEntryForm";
import { Button } from "@/frontend/components/ui/button";
import { supabase } from "@/backend/integrations/supabase/client";
import { toast } from "sonner";
import type { ScheduleEntry } from "@/frontend/hooks/use-schedule";

export const Route = createFileRoute("/_authenticated/schedule")({
  component: SchedulePage,
});

function SchedulePage() {
  const { hasRole, roles } = useAuth();
  const isAdmin = hasRole("admin");
  const isInstructor = hasRole("instructor");

  const role = isAdmin ? "admin" : isInstructor ? "instructor" : "student";
  const { data: entries = [], isLoading } = useScheduleEntries(
    undefined,
    role as "admin" | "instructor" | "student"
  );
  const deleteEntry = useDeleteScheduleEntry();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Lookup maps: moduleId → title, userId → name
  const [moduleNames, setModuleNames] = useState<Record<string, string>>({});
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!entries.length) return;

    const moduleIds = [...new Set(entries.map((e) => e.module_id).filter(Boolean) as string[])];
    const studentIds = [...new Set(entries.map((e) => e.student_id).filter(Boolean) as string[])];

    if (moduleIds.length > 0) {
      supabase
        .from("modules")
        .select("id, title")
        .in("id", moduleIds)
        .then(({ data }) => {
          if (data) {
            const map: Record<string, string> = {};
            for (const m of data) map[m.id] = m.title;
            setModuleNames(map);
          }
        });
    }

    if (studentIds.length > 0) {
      supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds)
        .then(({ data }) => {
          if (data) {
            const map: Record<string, string> = {};
            for (const p of data) map[p.id] = p.full_name ?? p.id.slice(0, 8) + "…";
            setStudentNames(map);
          }
        });
    }
  }, [entries]);

  const openCreate = () => {
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const openEdit = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteEntry.mutate(id, {
      onSuccess: () => {
        toast.success("Entry deleted");
        setConfirmDeleteId(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  // Group entries by date
  const grouped = entries.reduce<Record<string, ScheduleEntry[]>>((acc, entry) => {
    const date = entry.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  const todayStr = new Date().toISOString().split("T")[0];

  // Separate today's entries for the "Today" section
  const todayEntries = grouped[todayStr] ?? [];
  const otherDates = sortedDates.filter((d) => d !== todayStr);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // Color-code entries: past = muted, today = amber, future = normal
  const getEntryStyle = (dateStr: string) => {
    if (dateStr < todayStr) return "opacity-60";
    if (dateStr === todayStr) return "";
    return "";
  };

  const getDateHeaderStyle = (dateStr: string): React.CSSProperties => {
    if (dateStr === todayStr) return { borderLeft: "3px solid #f59e0b" };
    if (dateStr < todayStr) return { opacity: 0.6 };
    return { borderLeft: "3px solid #1e3a8a" };
  };

  const renderEntries = (dateEntries: ScheduleEntry[], dateStr: string) =>
    dateEntries
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((entry) => {
        const isDeleting = confirmDeleteId === entry.id;
        const moduleName = entry.module_id ? moduleNames[entry.module_id] : null;
        const studentName = entry.student_id ? studentNames[entry.student_id] : null;

        return (
          <div key={entry.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className="flex items-center gap-1.5 text-sm font-mono font-semibold min-w-[130px] shrink-0"
                style={{ color: dateStr === todayStr ? "#b45309" : "#1d4ed8" }}
              >
                <Clock className="size-3.5 shrink-0" />
                {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
              </div>
              <div className="space-y-0.5 min-w-0">
                {moduleName ? (
                  <p className="text-sm font-semibold text-gray-900 truncate">{moduleName}</p>
                ) : entry.module_id ? (
                  <p className="text-sm text-gray-500">Module session</p>
                ) : (
                  <p className="text-sm text-gray-400">General session</p>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="size-3 shrink-0" />
                    Instructor: {entry.instructor_id.slice(0, 8)}…
                  </div>
                )}
                {entry.student_id && isAdmin && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="size-3 shrink-0" />
                    Student: {studentName ?? entry.student_id.slice(0, 8) + "…"}
                  </div>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(entry)} className="text-gray-400 hover:text-gray-700">
                  <Pencil className="size-4" />
                </Button>
                {isDeleting ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(entry.id)} disabled={deleteEntry.isPending} className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">No</button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(entry.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Schedule</h1>
          <p className="section-subtitle">
            {isAdmin ? "Assign instructors to modules and manage timetables." : "View your upcoming lessons and sessions."}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-brand">
            <Plus className="size-4" /> Add Entry
          </button>
        )}
      </div>

      {/* Schedule list */}
      {isLoading ? (
        <div className="admin-card p-10 text-center text-sm text-gray-500">Loading schedule…</div>
      ) : sortedDates.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <Calendar className="mx-auto size-8 text-gray-300 mb-3" />
          <p className="text-gray-500">No schedule entries found.</p>
          {isAdmin && (
            <button onClick={openCreate} className="btn-outline mt-4">Add first entry</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today section */}
          {todayEntries.length > 0 && (
            <div className="admin-card overflow-hidden" style={{ borderLeft: "4px solid #b45309" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100" style={{ background: "#fef3c7" }}>
                <Calendar className="size-4" style={{ color: "#b45309" }} />
                <span className="text-sm font-bold" style={{ color: "#b45309" }}>
                  Today — {formatDate(todayStr)}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {renderEntries(todayEntries, todayStr)}
              </div>
            </div>
          )}

          {/* Other dates */}
          {otherDates.map((date) => (
            <div key={date} className="admin-card overflow-hidden" style={date < todayStr ? { opacity: 0.65 } : { borderLeft: "4px solid #1d4ed8" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <Calendar className="size-4" style={{ color: date < todayStr ? "#94a3b8" : "#1d4ed8" }} />
                <span className="text-sm font-semibold text-gray-700">{formatDate(date)}</span>
                {date < todayStr && <span className="ml-auto text-xs text-gray-400">Past</span>}
              </div>
              <div className="divide-y divide-gray-50">
                {renderEntries(grouped[date], date)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule entry form dialog */}
      <ScheduleEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
      />
    </div>
  );
}
