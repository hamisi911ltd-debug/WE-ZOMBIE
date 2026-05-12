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
  paymentMethod: z.string().optional(),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
  paidDate: z.string().optional(),
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
      dueDate: payment?.dueDate ?? new Date().toISOString().split('T')[0],
      status: payment?.status ?? "pending",
      paymentMethod: (payment as any)?.paymentMethod ?? "cash",
      transactionRef: (payment as any)?.transactionRef ?? "",
      notes: (payment as any)?.notes ?? "",
      paidDate: (payment as any)?.paidDate ?? "",
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
        await updatePayment.mutateAsync({ 
          id: payment.id, 
          amount: values.amount, 
          dueDate: values.dueDate, 
          status: values.status,
          paymentMethod: values.paymentMethod,
          transactionRef: values.transactionRef,
          notes: values.notes,
          paidDate: values.status === 'paid' ? (values.paidDate || new Date().toISOString().split('T')[0]) : null,
          ...(proofUrl !== undefined && { proofUrl: proofUrl }) 
        });
        toast.success("Payment updated");
      } else {
        const created = await createPayment.mutateAsync({ 
          userId: values.userId, 
          amount: values.amount, 
          dueDate: values.dueDate, 
          status: values.status,
          paymentMethod: values.paymentMethod,
          transactionRef: values.transactionRef,
          notes: values.notes,
          paidDate: values.status === 'paid' ? (values.paidDate || new Date().toISOString().split('T')[0]) : null,
        });
        if (proofFile && created) {
          const proofUrl = await uploadProof((created as any).id);
          if (proofUrl) await updatePayment.mutateAsync({ id: (created as any).id, proofUrl: proofUrl });
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-all" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
            <DialogPrimitive.Title className="font-display text-lg font-bold text-slate-900">
              {isEditing ? "Edit Payment" : "Manual Payment Entry"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {isAdmin && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="userId" className={labelClass}>Student</label>
                  <select id="userId" {...form.register("userId")} className={inputClass}>
                    <option value="">Select a student…</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.fullName ?? s.email ?? s.id}</option>)}
                  </select>
                  {form.formState.errors.userId && <p className={errorClass}>{form.formState.errors.userId.message}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className={labelClass}>Amount (KES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">KES</span>
                  <input 
                    id="amount"
                    {...form.register("amount")} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    className={inputClass + " pl-12"}
                    autoComplete="off"
                  />
                </div>
                {form.formState.errors.amount && <p className={errorClass}>{form.formState.errors.amount.message}</p>}
              </div>
              <div>
                <label htmlFor="status" className={labelClass}>Status</label>
                <select id="status" {...form.register("status")} className={inputClass}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className={labelClass}>Due Date</label>
                <input id="dueDate" {...form.register("dueDate")} type="date" className={inputClass} />
                {form.formState.errors.dueDate && <p className={errorClass}>{form.formState.errors.dueDate.message}</p>}
              </div>
              <div>
                <label htmlFor="paidDate" className={labelClass}>Paid Date (Optional)</label>
                <input id="paidDate" {...form.register("paidDate")} type="date" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentMethod" className={labelClass}>Payment Method</label>
                <select id="paymentMethod" {...form.register("paymentMethod")} className={inputClass}>
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="transactionRef" className={labelClass}>Transaction Ref</label>
                <input 
                  id="transactionRef"
                  {...form.register("transactionRef")} 
                  placeholder="e.g. QWE123RTY" 
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>Notes</label>
              <textarea 
                id="notes"
                {...form.register("notes")} 
                rows={2} 
                className={inputClass + " resize-none"} 
                placeholder="Add internal notes..." 
              />
            </div>

            <div className="pt-2">
              <label className={labelClass}>Payment Proof (PDF, max 10 MB)</label>
              <div className="mt-2">
                {proofFile ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="flex-1 truncate font-medium text-slate-700">{proofFile.name}</span>
                    <button type="button" onClick={() => { setProofFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-slate-400 hover:text-red-500">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-6 text-sm text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-all">
                    <Upload className="size-6 text-slate-400" />
                    <span>Click to upload PDF receipt or proof</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="px-6 py-2 text-sm font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow-lg shadow-red-900/20 disabled:opacity-50 transition-all">
                {isPending ? "Processing..." : isEditing ? "Update Payment" : "Save Payment"}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
