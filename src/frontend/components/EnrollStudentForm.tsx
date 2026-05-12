import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCourses } from "@/frontend/hooks/use-courses";
import { useCreateEnrollment } from "@/frontend/hooks/use-enrollments";
import { usersAPI } from "@/lib/api-client";

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
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

  const step1Form = useForm<Step1Values>({ 
    resolver: zodResolver(step1Schema), 
    defaultValues: { fullName: "", email: "", phone: "" } 
  });
  const step2Form = useForm<Step2Values>({ resolver: zodResolver(step2Schema), defaultValues: { courseId: "" } });

  const handleClose = () => {
    setStep(1); setNewUserId(null);
    step1Form.reset(); step2Form.reset();
    onOpenChange(false);
  };

  const handleStep1 = async (values: Step1Values) => {
    setIsSubmitting(true);
    try {
      const res = await usersAPI.create({
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
        role: "student",
        password: values.phone, // Use phone as password for students
      });
      
      setNewUserId(res.id);
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
      { userId: newUserId, courseId: values.courseId, status: "active" },
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
                <label htmlFor="fullName" className={labelClass}>Full Name</label>
                <input 
                  id="fullName"
                  {...step1Form.register("fullName")} 
                  placeholder="e.g. Jane Doe" 
                  className={inputClass}
                  autoComplete="name"
                />
                {step1Form.formState.errors.fullName && <p className={errorClass}>{step1Form.formState.errors.fullName.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <input 
                  id="email"
                  {...step1Form.register("email")} 
                  type="email" 
                  placeholder="student@example.com" 
                  className={inputClass}
                  autoComplete="email"
                />
                {step1Form.formState.errors.email && <p className={errorClass}>{step1Form.formState.errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone Number</label>
                <input 
                  id="phone"
                  {...step1Form.register("phone")} 
                  placeholder="e.g. 0712345678" 
                  className={inputClass}
                  autoComplete="tel"
                />
                {step1Form.formState.errors.phone && <p className={errorClass}>{step1Form.formState.errors.phone.message}</p>}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Account Access:</strong> The student will be able to log in using their 
                  email address and their <strong>phone number</strong> as the initial password.
                </p>
              </div>
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
                <label htmlFor="courseId" className={labelClass}>Assign to Course</label>
                <select id="courseId" {...step2Form.register("courseId")} className={inputClass}>
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
