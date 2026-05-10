import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserCircle, Loader2, BookOpen, CreditCard, FileImage, X } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/frontend/hooks/use-profile";
import { useEnrollments } from "@/frontend/hooks/use-enrollments";
import { usePayments } from "@/frontend/hooks/use-payments";
import { useCourses } from "@/frontend/hooks/use-courses";
import { supabase } from "@/backend/integrations/supabase/client";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface StudentDetailProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetail({ studentId, open, onOpenChange }: StudentDetailProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useProfile(studentId);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(studentId);
  const { data: allPayments = [], isLoading: paymentsLoading } = usePayments(studentId);
  const { data: courses = [] } = useCourses();
  const updateProfile = useUpdateProfile();

  const payments = allPayments.filter((p) => p.user_id === studentId);
  const courseMap = new Map(courses.map((c) => [c.id, c.title]));
  const isLoading = profileLoading || enrollmentsLoading || paymentsLoading;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFileError("Only image files are accepted."); e.target.value = ""; return; }
    if (file.size > MAX_FILE_SIZE_BYTES) { setFileError("File is too large. Maximum 10 MB."); e.target.value = ""; return; }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const filePath = `${studentId}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await updateProfile.mutateAsync({ userId: studentId, updates: { avatar_url: publicUrlData.publicUrl } });
      toast.success("Identity document uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ background: "rgba(15,23,42,0.50)" }}
        />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ background: "#ffffff", borderRadius: "1rem", boxShadow: "0 20px 60px rgba(0,0,0,0.20)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <DialogPrimitive.Title className="font-display text-lg font-bold text-gray-900">
              Student Details
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Profile */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <UserCircle className="size-3.5" /> Profile
                  </h3>
                  <div className="flex items-start gap-4">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="size-14 rounded-full object-cover" style={{ border: "2px solid #e2e8f0" }} />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}>
                        <UserCircle className="size-7 text-white" />
                      </div>
                    )}
                    <dl className="flex-1 space-y-1 text-sm">
                      <div className="flex gap-2"><dt className="w-16 shrink-0 text-gray-400">Name</dt><dd className="font-semibold text-gray-900">{profile?.full_name ?? "—"}</dd></div>
                      <div className="flex gap-2"><dt className="w-16 shrink-0 text-gray-400">Phone</dt><dd className="text-gray-700">{profile?.phone ?? "—"}</dd></div>
                      <div className="flex gap-2"><dt className="w-16 shrink-0 text-gray-400">Joined</dt><dd className="text-gray-700">{profile?.created_at ? formatDate(profile.created_at) : "—"}</dd></div>
                    </dl>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Enrollment */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <BookOpen className="size-3.5" /> Enrollment
                  </h3>
                  {enrollments.length === 0 ? (
                    <p className="text-sm text-gray-400">No active enrollments.</p>
                  ) : (
                    <ul className="space-y-2">
                      {enrollments.map((e) => (
                        <li key={e.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{courseMap.get(e.course_id) ?? "Unknown Course"}</p>
                            <p className="text-xs text-gray-400">Enrolled {formatDate(e.enrolled_at)}</p>
                          </div>
                          <span className={`badge ${e.status === "active" ? "badge-green" : e.status === "completed" ? "badge-blue" : "badge-red"}`}>{e.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <hr className="border-gray-100" />

                {/* Payments */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <CreditCard className="size-3.5" /> Payment History
                  </h3>
                  {payments.length === 0 ? (
                    <p className="text-sm text-gray-400">No payment records found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {payments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                            <p className="text-xs text-gray-400">Due {formatDate(p.due_date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${p.status === "paid" ? "badge-green" : p.status === "pending" ? "badge-amber" : "badge-red"}`}>{p.status}</span>
                            {p.proof_url && <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline" style={{ color: "#1d4ed8" }}>Proof</a>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <hr className="border-gray-100" />

                {/* Documents */}
                <section>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <FileImage className="size-3.5" /> Identity Documents
                  </h3>
                  {profile?.avatar_url && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs text-gray-400">Current document:</p>
                      <a href={profile.avatar_url} target="_blank" rel="noopener noreferrer">
                        <img src={profile.avatar_url} alt="Document" className="h-20 w-auto rounded-lg object-cover hover:opacity-80 transition-opacity" style={{ border: "1px solid #e2e8f0" }} />
                      </a>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Upload Identity Document</label>
                    <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 10 MB</p>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleFileChange}
                        className="form-input flex-1 file:mr-3 file:rounded file:border-0 file:bg-red-800 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white cursor-pointer disabled:opacity-50"
                      />
                      {uploading && <Loader2 className="size-5 animate-spin text-gray-400" />}
                    </div>
                    {fileError && <p className="text-xs text-red-600">{fileError}</p>}
                  </div>
                </section>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
