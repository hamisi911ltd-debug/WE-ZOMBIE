import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ConflictWarning } from "@/frontend/components/ConflictWarning";
import {
  useCreateScheduleEntry,
  useUpdateScheduleEntry,
  useDeleteScheduleEntry,
  useScheduleEntries,
} from "@/frontend/hooks/use-schedule";
import { useStudents } from "@/frontend/hooks/use-students";
import { hasScheduleConflict } from "@/backend/lib/schedule";
import { useAuth } from "@/backend/lib/auth-context";
import type { ScheduleEntry } from "@/frontend/hooks/use-schedule";
import type { ScheduleConflict } from "@/backend/types/domain";
import { getInstructorsFn } from "@/backend/lib/api-profile";
import { getModulesFn } from "@/backend/lib/api-modules";

const scheduleSchema = z
  .object({
    instructorId: z.string().min(1, "Instructor is required"),
    moduleId: z.string().optional(),
    studentId: z.string().optional(),
    scheduledDate: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ScheduleEntry;
}

export function ScheduleEntryForm({ open, onOpenChange, entry }: ScheduleEntryFormProps) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [conflict, setConflict] = useState<ScheduleConflict | null>(null);
  const [pendingValues, setPendingValues] = useState<ScheduleFormValues | null>(null);
  const [instructors, setInstructors] = useState<Array<{ id: string; fullName: string | null }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);

  const { data: students = [] } = useStudents();
  const { data: allEntries = [] } = useScheduleEntries(undefined, "admin");
  const createEntry = useCreateScheduleEntry();
  const updateEntry = useUpdateScheduleEntry();
  const deleteEntry = useDeleteScheduleEntry();

  const isEditing = !!entry;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      instructorId: entry?.instructorId ?? (hasRole("instructor") ? (user?.id ?? "") : ""),
      moduleId: entry?.moduleId ?? "",
      studentId: entry?.studentId ?? "",
      scheduledDate: entry?.scheduledDate ?? "",
      startTime: entry?.startTime ?? "",
      endTime: entry?.endTime ?? "",
    },
  });

  useEffect(() => {
    getInstructorsFn().then((data) => setInstructors(data as any));
  }, []);

  useEffect(() => {
    getModulesFn().then((data) => setModules(data as any));
  }, []);

  const handleClose = () => {
    form.reset();
    setConflict(null);
    setPendingValues(null);
    onOpenChange(false);
  };

  const submitEntry = async (values: ScheduleFormValues) => {
    const payload = {
      instructorId: values.instructorId,
      moduleId: values.moduleId || null,
      studentId: values.studentId || null,
      scheduledDate: values.scheduledDate,
      startTime: values.startTime,
      endTime: values.endTime,
    };
    try {
      if (isEditing && entry) {
        await updateEntry.mutateAsync({ id: entry.id, ...payload });
        toast.success("Schedule entry updated");
      } else {
        await createEntry.mutateAsync(payload);
        toast.success("Schedule entry created");
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const onSubmit = async (values: ScheduleFormValues) => {
    const candidateEntry = {
      id: entry?.id ?? "__new__",
      instructorId: values.instructorId,
      studentId: values.studentId ?? null,
      scheduledDate: values.scheduledDate,
      startTime: values.startTime,
      endTime: values.endTime,
    };
    const conflictingEntry = allEntries.find(
      (e) => e.id !== entry?.id && e.instructorId === values.instructorId && hasScheduleConflict(candidateEntry as any, e)
    );
    if (conflictingEntry) {
      setConflict({ conflictingEntryId: conflictingEntry.id, instructorId: conflictingEntry.instructorId, date: conflictingEntry.scheduledDate, startTime: conflictingEntry.startTime, endTime: conflictingEntry.endTime });
      setPendingValues(values);
      return;
    }
    await submitEntry(values);
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Schedule entry deleted");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending || deleteEntry.isPending;
  const inputClass = "form-input mt-1";
  const labelClass = "block text-sm font-semibold text-gray-700";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" style={{ background: "rgba(15,23,42,0.50)" }} />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ background: "#ffffff", borderRadius: "1rem", boxShadow: "0 20px 60px rgba(0,0,0,0.20)" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <DialogPrimitive.Title className="font-display text-lg font-bold text-gray-900">
              {isEditing ? "Edit Schedule Entry" : "Add Schedule Entry"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Instructor</label>
              <select {...form.register("instructorId")} disabled={!isAdmin} className={inputClass + " disabled:opacity-60"}>
                <option value="">Select an instructor…</option>
                {instructors.map((i) => <option key={i.id} value={i.id}>{i.fullName ?? i.id}</option>)}
              </select>
              {form.formState.errors.instructorId && <p className={errorClass}>{form.formState.errors.instructorId.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Module (optional)</label>
              <select {...form.register("moduleId")} className={inputClass}>
                <option value="">No module</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Student (optional)</label>
              <select {...form.register("studentId")} className={inputClass}>
                <option value="">No student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName ?? s.id}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Date</label>
              <input {...form.register("scheduledDate")} type="date" className={inputClass} />
              {form.formState.errors.scheduledDate && <p className={errorClass}>{form.formState.errors.scheduledDate.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Time</label>
                <input {...form.register("startTime")} type="time" className={inputClass} />
                {form.formState.errors.startTime && <p className={errorClass}>{form.formState.errors.startTime.message}</p>}
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input {...form.register("endTime")} type="time" className={inputClass} />
                {form.formState.errors.endTime && <p className={errorClass}>{form.formState.errors.endTime.message}</p>}
              </div>
            </div>

            {conflict && (
              <ConflictWarning
                conflict={conflict}
                onConfirm={async () => { setConflict(null); if (pendingValues) await submitEntry(pendingValues); }}
                onCancel={() => { setConflict(null); setPendingValues(null); }}
              />
            )}

            <div className="flex items-center justify-between pt-2">
              {isEditing && isAdmin && (
                <button type="button" onClick={handleDelete} disabled={isPending} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
                  Delete
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={handleClose} className="btn-outline">Cancel</button>
                <button type="submit" disabled={isPending || !!conflict} className="btn-brand disabled:opacity-60">
                  {isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
