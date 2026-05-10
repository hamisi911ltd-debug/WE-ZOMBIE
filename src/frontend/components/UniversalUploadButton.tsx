import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/backend/lib/auth-context";
import { getUploadButtonContextKey, getUploadButtonContext } from "@/backend/lib/upload-button-context";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { EnrollStudentForm } from "@/frontend/components/EnrollStudentForm";
import { PaymentForm } from "@/frontend/components/PaymentForm";
import { ScheduleEntryForm } from "@/frontend/components/ScheduleEntryForm";

/**
 * Floating action button visible only to admin users.
 * Opens a context-sensitive form based on the current route.
 * Implements Requirements 2.1–2.6
 */
export function UniversalUploadButton() {
  const { roles } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  if (!roles.includes("admin")) return null;

  const contextKey = getUploadButtonContextKey(loc.pathname);
  const actionLabel = getUploadButtonContext(loc.pathname);

  // For students/payments/schedule, delegate to the dedicated form components
  if (contextKey === "students") {
    return <EnrollStudentForm open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95"
        style={{ background: "#8b1a1a", boxShadow: "0 4px 20px rgba(139,26,26,0.40)" }}
        title={actionLabel}
      >
        <Plus className="size-6" />
      </button>
    </EnrollStudentForm>;
  }

  if (contextKey === "payments") {
    return <PaymentForm open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95"
        style={{ background: "#8b1a1a", boxShadow: "0 4px 20px rgba(139,26,26,0.40)" }}
        title={actionLabel}
      >
        <Plus className="size-6" />
      </button>
    </PaymentForm>;
  }

  if (contextKey === "schedule") {
    return <ScheduleEntryForm open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95"
        style={{ background: "#8b1a1a", boxShadow: "0 4px 20px rgba(139,26,26,0.40)" }}
        title={actionLabel}
      >
        <Plus className="size-6" />
      </button>
    </ScheduleEntryForm>;
  }

  // Default: just the button (courses page uses inline form)
  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95"
      style={{ background: "#8b1a1a", boxShadow: "0 4px 20px rgba(139,26,26,0.40)" }}
      title={actionLabel}
    >
      <Plus className="size-6" />
    </button>
  );
}
