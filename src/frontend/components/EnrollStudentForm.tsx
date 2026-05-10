import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCourses } from "@/frontend/hooks/use-courses";
import { useCreateEnrollment } from "@/frontend/hooks/use-enrollments";
import { supabase } from "@/backend/integrations/supabase/client";

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z.object({
  courseId: z.string().min(1, "Please select a course"),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

interface EnrollStudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentForm({ open, onOpenChange }: EnrollStudentFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: courses = [] } = useCourses();
  const createEnrollment = useCreateEnrollment();

  const step1Form = useForm<Step1Values>({ resolver: zodResolver(step1Schema), defaultValues: { fullName: "", email: "" } });
  const step2Form = useForm<Step2Values>({ resolver: zodResolver(step2Schema), defaultValues: { courseId: "" } });

  const handleClose = () => {
    setStep(1); setNewUserId(null);
    step1Form.reset(); step2Form.reset();
    onOpenChange(false);
  };

  const handleStep1 = async (values: Step1Values) => {
    setIsSubmitting(true);
    try {
      const tempPassword = crypto.randomUUID();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: { data: { full_name: values.fullName } },
      });
      if (signUpError) throw signUpError;
      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Failed to create user account");

      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: "student" });
      if (roleError) throw roleError;

      const { error: profileError } = await supabase.from("profiles").insert({ id: userId, full_name: values.fullName });
      if (profileError) throw profileError;

      setNewUserId(userId);
      toast.success("Student account created");
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create student account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2 = async (values: Step2Values) => {
    if (!newUserId) return;
    createEnrollment.mutate(
      { user_id: newUserId, course_id: values.courseId, status: "active" },
      {
        onSuccess: () => { toast.success("Student enrolled in course"); handleClose(); },
        onError: (err) => toast.error(err.message),
      },
    );
  };

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
              {step === 1 ? "Enroll Student — Step 1 of 2" : "Enroll Student — Step 2 of 2"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="px-6 pt-4">
            <div className="flex gap-2">
              <div className="h-1.5 flex-1 rounded-full" style={{ background: step >= 1 ? "#8b1a1a" : "#e2e8f0" }} />
              <div className="h-1.5 flex-1 rounded-full" style={{ background: step >= 2 ? "#8b1a1a" : "#e2e8f0" }} />
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={step1Form.handleSubmit(handleStep1)} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input {...step1Form.register("fullName")} placeholder="e.g. Jane Doe" className={inputClass} />
                {step1Form.formState.errors.fullName && <p className={errorClass}>{step1Form.formState.errors.fullName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input {...step1Form.register("email")} type="email" placeholder="student@example.com" className={inputClass} />
                {step1Form.formState.errors.email && <p className={errorClass}>{step1Form.formState.errors.email.message}</p>}
              </div>
              <p className="text-xs text-gray-400">A confirmation email will be sent to the student to set their password.</p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleClose} className="btn-outline">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-brand disabled:opacity-60">
                  {isSubmitting ? "Creating…" : "Next →"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={step2Form.handleSubmit(handleStep2)} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Assign to Course</label>
                <select {...step2Form.register("courseId")} className={inputClass}>
                  <option value="">Select a course…</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {step2Form.formState.errors.courseId && <p className={errorClass}>{step2Form.formState.errors.courseId.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-outline">← Back</button>
                <button type="submit" disabled={createEnrollment.isPending} className="btn-brand disabled:opacity-60">
                  {createEnrollment.isPending ? "Enrolling…" : "Enroll Student"}
                </button>
              </div>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
