import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, AlertCircle, Pencil, Plus, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/backend/lib/auth-context";
import { usePayments, useUpdatePayment, useDeletePayment } from "@/frontend/hooks/use-payments";
import { isOverdue } from "@/backend/lib/payments";
import { ReceiptDownload } from "@/frontend/components/ReceiptDownload";
import { PaymentForm } from "@/frontend/components/PaymentForm";
import { Button } from "@/frontend/components/ui/button";
import { toast } from "sonner";
import type { Payment } from "@/frontend/hooks/use-payments";

export const Route = createFileRoute("/_authenticated/payments")({
  component: PaymentsPage,
});

function SummaryCard({
  label,
  value,
  icon: Icon,
  bg,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  bg: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-black text-gray-900 font-mono">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: bg }}>
          <Icon className="size-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function PaymentsPage() {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");

  const { data: payments = [], isLoading } = usePayments();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const now = new Date();

  const handleMarkPaid = (payment: Payment) => {
    updatePayment.mutate({ id: payment.id, status: "paid" }, {
      onSuccess: () => toast.success("Payment marked as paid"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = (id: string) => {
    deletePayment.mutate(id, {
      onSuccess: () => { toast.success("Payment deleted"); setConfirmDeleteId(null); },
      onError: (err) => toast.error(err.message),
    });
  };

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending" && !isOverdue(p, now)).reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = payments.filter((p) => isOverdue(p, now)).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Payments</h1>
          <p className="section-subtitle">
            {isAdmin ? "Log fees, upload proofs, and generate receipts." : "View your payment history and download receipts."}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingPayment(undefined); setFormOpen(true); }} className="btn-brand">
            <Plus className="size-4" /> New Payment
          </button>
        )}
      </div>

      {/* Summary stats */}
      {!isLoading && payments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total Paid" value={`KES ${totalPaid.toLocaleString()}`} icon={CheckCircle2} bg="#dcfce7" color="#15803d" />
          <SummaryCard label="Pending" value={`KES ${totalPending.toLocaleString()}`} icon={Clock} bg="#fef3c7" color="#b45309" />
          <SummaryCard label="Overdue" value={`KES ${totalOverdue.toLocaleString()}`} icon={XCircle} bg="#fee2e2" color="#b91c1c" />
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading payments…</div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto size-8 text-gray-300 mb-3" />
            <p className="text-gray-500">No payments found.</p>
            {isAdmin && (
              <button onClick={() => setFormOpen(true)} className="btn-outline mt-4">
                Create first payment
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {isAdmin && <th>Student</th>}
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const overdue = isOverdue(payment, now);
                  const isDeleting = confirmDeleteId === payment.id;
                  const sName = (payment as any).studentName || "Unknown Student";
                  return (
                    <tr key={payment.id} style={overdue ? { background: "#fef2f2" } : {}}>
                      {isAdmin && <td className="font-medium">{sName}</td>}
                      <td className="font-mono font-bold">KES {Number(payment.amount).toLocaleString()}</td>
                      <td className="text-xs uppercase text-slate-500 font-semibold">{(payment as any).paymentMethod || "—"}</td>
                      <td className="text-gray-500">
                        {new Date(payment.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`badge ${payment.status === "paid" ? "badge-green" : payment.status === "pending" ? "badge-amber" : "badge-red"}`}>
                            {payment.status}
                          </span>
                          {overdue && (
                            <span className="badge badge-red">
                              <AlertCircle className="size-3 mr-1" />Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 flex-wrap">
                          <ReceiptDownload
                            payment={payment}
                            studentName={isAdmin ? getStudentName(payment.userId) : (user?.fullName ?? user?.email ?? "Student")}
                          />
                          {isAdmin && payment.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(payment)} disabled={updatePayment.isPending} className="text-green-700 hover:text-green-800 hover:bg-green-50 text-xs gap-1">
                              <CheckCircle2 className="size-3.5" /> Mark Paid
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="sm" onClick={() => { setEditingPayment(payment); setFormOpen(true); }} className="text-gray-500 hover:text-gray-700">
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {payment.proofUrl && (
                            <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: "#1d4ed8" }}>
                              Proof
                            </a>
                          )}
                          {isAdmin && (isDeleting ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(payment.id)} disabled={deletePayment.isPending} className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Yes</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="rounded px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">No</button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(payment.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="size-4" />
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaymentForm open={formOpen} onOpenChange={setFormOpen} payment={editingPayment} />
    </div>
  );
}
