import { AlertTriangle } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import type { ScheduleConflict } from "@/backend/types/domain";

interface ConflictWarningProps {
  conflict: ScheduleConflict;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Inline alert that warns about a scheduling conflict.
 * Shows conflicting entry details and lets the user confirm or cancel.
 *
 * Implements Requirements 7.2, 5.4
 */
export function ConflictWarning({ conflict, onConfirm, onCancel }: ConflictWarningProps) {
  const formattedDate = new Date(conflict.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format HH:MM time strings to 12-hour display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-amber-300">Scheduling Conflict</p>
          <p className="text-sm text-amber-200/80">
            This time slot conflicts with an existing entry:
          </p>
          <div className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            <p>
              <span className="font-medium">Date:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium">Time:</span>{" "}
              {formatTime(conflict.startTime)} – {formatTime(conflict.endTime)}
            </p>
          </div>
          <p className="text-xs text-amber-300/70">
            Do you want to schedule anyway?
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-xl text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
        >
          Confirm anyway
        </Button>
      </div>
    </div>
  );
}
