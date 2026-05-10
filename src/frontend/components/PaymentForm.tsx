import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCreatePayment, useUpdatePayment } from "@/frontend/hooks/use-payments";
import { useStudents } from "@/frontend/hooks/use-students";
import { useAuth } from "@/backend/lib/auth-context";
import type { Payment } from "@/frontend/hooks/use-payments";

const paymentSchema = z.object({
  userId: z.string().min(1, "Please select a student"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid", "overdue"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function PaymentForm({ open, onOpenChange, payment }: PaymentFormProps) {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: students = [] } = useStudents();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const isEditing = !!payment;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      userId: payment?.userId ?? (isAdmin ? "" : (user?.id ?? "")),
      amount: payment?.amount ?? 0,
      dueDate: payment?.dueDate ?? "",
      status: payment?.status ?? "pending",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Only PDF files are allowed"); return; }
    if (file.size > MAX_FILE_SIZE) { toast.error("File must be smaller than 10 MB"); return; }
    setProofFile(file);
  };

  const uploadProof = async (paymentId: string): Promise<string | null> => {
    // TODO: Implement Cloudflare R2 upload
    console.log("Proof upload requested for", paymentId, proofFile?.name);
    return null;
  };

  const handleClose = () => { form.reset(); setProofFile(null); onOpenChange(false); };

  const onSubmit = async (values: PaymentFormValues) => {
    setIsUploading(true);
    try {
      if (isEditing && payment) {
        let proofUrl = payment.proofUrl;
        if (proofFile) proofUrl = await uploadProof(payment.id);
        await updatePayment.mutateAsync({ id: payment.id, amount: values.amount, dueDate: values.dueDate, status: values.status, ...(proofUrl !== undefined && { proofUrl: proofUrl }) });
        toast.success("Payment updated");
      } else {
        const created = await createPayment.mutateAsync({ userId: values.userId, amount: values.amount, dueDate: values.dueDate, status: values.status });
        if (proofFile && created) {
          const proofUrl = await uploadProof(created.id);
          if (proofUrl) await updatePayment.mutateAsync({ id: created.id, proofUrl: proofUrl });
        }
        toast.success("Payment created");
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createPayment.isPending || updatePayment.isPending || isUploading;
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
              {isEditing ? "Edit Payment" : "New Payment"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {isAdmin && (
              <div>
                <label className={labelClass}>Student</label>
                <select {...form.register("userId")} className={inputClass}>
                  <option value="">Select a student…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.fullName ?? s.id}</option>)}
                </select>
                {form.formState.errors.userId && <p className={errorClass}>{form.formState.errors.userId.message}</p>}
              </div>
            )}

            <div>
              <label className={labelClass}>Amount (USD)</label>
              <input {...form.register("amount")} type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
              {form.formState.errors.amount && <p className={errorClass}>{form.formState.errors.amount.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Due Date</label>
              <input {...form.register("dueDate")} type="date" className={inputClass} />
              {form.formState.errors.dueDate && <p className={errorClass}>{form.formState.errors.dueDate.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select {...form.register("status")} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Payment Proof (PDF, max 10 MB)</label>
              <div className="mt-1">
                {proofFile ? (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <span className="flex-1 truncate text-gray-700">{proofFile.name}</span>
                    <button type="button" onClick={() => { setProofFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-gray-400 hover:text-gray-600">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                    <Upload className="size-4" /> Click to upload PDF proof
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose} className="btn-outline">Cancel</button>
              <button type="submit" disabled={isPending} className="btn-brand disabled:opacity-60">
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Payment"}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
