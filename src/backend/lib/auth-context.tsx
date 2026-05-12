import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authAPI } from "@/lib/api-client";

export type AppRole = "admin" | "instructor" | "student";

interface AuthCtx {
  session: { id: string, email: string, fullName: string | null } | null;
  user: { id: string, email: string, fullName: string | null } | null;
  roles: AppRole[];
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (r: AppRole) => boolean;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ id: string, email: string, fullName: string | null } | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    console.log("Checking session...");
    setLoading(true);
    try {
      const data = await authAPI.getSession();
      console.log("Session data received:", data);
      if (data && data.user) {
        setSession(data.user);
        setRoles(data.roles as AppRole[]);
        console.log("Session set successfully:", data.user.email, "Roles:", data.roles);
        return data; // Return the session data
      } else {
        setSession(null);
        setRoles([]);
        console.log("No valid session data");
        return null;
      }
    } catch (err) {
      console.error('Auth session check failed:', err);
      setSession(null);
      setRoles([]);
      return null;
    } finally {
      setLoading(false);
      console.log("Session check complete");
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session,
      roles,
      loading,
      isAuthenticated: !!session,
      hasRole: (r) => roles.includes(r),
      signOut: async () => {
        await authAPI.logout();
        setSession(null);
        setRoles([]);
      },
      checkSession,
      refreshRoles: checkSession,
    }),
    [session, roles, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
