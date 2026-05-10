import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSessionFn, logoutFn } from "./auth-server";

export type AppRole = "admin" | "instructor" | "student";

interface AuthCtx {
  session: { id: string, email: string } | null;
  user: { id: string, email: string } | null;
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
  const [session, setSession] = useState<{ id: string, email: string } | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const data = await getSessionFn();
      if (data) {
        setSession(data.user);
        setRoles(data.roles as AppRole[]);
      } else {
        setSession(null);
        setRoles([]);
      }
    } catch (err) {
      setSession(null);
      setRoles([]);
    } finally {
      setLoading(false);
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
        await logoutFn();
        setSession(null);
        setRoles([]);
      },
      checkSession,
      refreshRoles: checkSession, // We can just call checkSession to refresh everything
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
