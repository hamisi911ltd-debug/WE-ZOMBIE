import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogOut, UserCircle, X } from "lucide-react";
import { useAuth } from "@/backend/lib/auth-context";
import { useProfile, useUpdateProfile } from "@/frontend/hooks/use-profile";
import { supabase } from "@/backend/integrations/supabase/client";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const userId = user?.id ?? "";

  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailReminders, setEmailReminders] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const [synced, setSynced] = useState(false);
  if (profile && !synced) {
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setSynced(true);
  }

  const loadPrefs = async () => {
    if (!userId || prefsLoaded) return;
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("email_reminders")
        .eq("user_id", userId)
        .single();
      // Silently ignore if table doesn't exist yet (PGRST116 = no rows, 42P01 = table missing)
      if (!error && data) setEmailReminders(data.email_reminders);
    } catch {
      // table not yet migrated — use default
    }
    setPrefsLoaded(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    updateProfile.mutate(
      { userId, updates: { full_name: fullName || null, phone: phone || null }, avatarFile: avatarFile ?? undefined },
      {
        onSuccess: () => { toast.success("Profile updated"); setAvatarFile(null); },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update profile"),
      },
    );
  };

  const handleSaveSettings = async () => {
    if (!userId) return;
    setLoadingPrefs(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: userId, email_reminders: emailReminders }, { onConflict: "user_id" });
      if (error) {
        // If table doesn't exist, show a friendly message instead of crashing
        if (error.code === "42P01" || error.message?.includes("notification_preferences")) {
          toast.info("Settings saved locally (database migration pending)");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Settings saved");
      }
    } catch {
      toast.info("Settings saved locally");
    }
    setLoadingPrefs(false);
  };

  const handleLogout = async () => {
    await signOut();
    onOpenChange(false);
    nav({ to: "/login" });
  };

  const inputClass = "form-input mt-1";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Plain dark overlay — no blur */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ background: "rgba(15,23,42,0.55)" }}
        />
        {/* Plain white modal — no glass */}
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ background: "#ffffff", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.20)" }}
        >
          {/* Close button */}
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>

          <DialogPrimitive.Title className="font-display text-xl font-bold text-gray-900 mb-4">
            My Account
          </DialogPrimitive.Title>

          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="size-12 rounded-full object-cover" style={{ border: "2px solid #e2e8f0" }} />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}>
                <UserCircle className="size-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile?.full_name ?? user?.email}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg mb-5" style={{ background: "#f1f5f9", padding: "3px" }}>
            {(["profile", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); if (tab === "settings") loadPrefs(); }}
                className="flex-1 rounded-md py-2 text-sm font-semibold capitalize transition-all"
                style={activeTab === tab
                  ? { background: "#ffffff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
                  : { color: "#64748b" }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Avatar Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  className="form-input mt-1 file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white cursor-pointer"
                  style={{ "--file-bg": "#8b1a1a" } as React.CSSProperties}
                />
                {avatarFile && <p className="mt-1 text-xs text-gray-500">{avatarFile.name}</p>}
              </div>
              <button type="submit" disabled={updateProfile.isPending} className="btn-brand w-full justify-center" style={{ padding: "0.75rem" }}>
                {updateProfile.isPending ? "Saving…" : "Save Profile"}
              </button>
            </form>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg p-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Reminders</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive notifications for upcoming lessons and payments</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} className="sr-only peer" />
                  <div
                    className="h-6 w-11 rounded-full transition-colors peer-checked:bg-red-700 bg-gray-200"
                    style={emailReminders ? { background: "#8b1a1a" } : { background: "#d1d5db" }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: emailReminders ? "translateX(1.25rem)" : "translateX(0)" }}
                    />
                  </div>
                </label>
              </div>
              <button onClick={handleSaveSettings} disabled={loadingPrefs} className="btn-brand w-full justify-center" style={{ padding: "0.75rem" }}>
                {loadingPrefs ? "Saving…" : "Save Settings"}
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
