import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Car,
  UserCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, loading, user, roles, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) nav({ to: "/login" });
  }, [loading, isAuthenticated, nav]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/courses", label: "Courses", icon: GraduationCap },
    ...(isAdmin ? [{ to: "/students", label: "Students", icon: Users }] : []),
    { to: "/payments", label: "Payments", icon: CreditCard },
    { to: "/schedule", label: "Schedule", icon: Calendar },
  ] as const;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        {/* Sidebar */}
        <aside className="glass-strong sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl p-5 lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-brand glow">
              <Car className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Paco</span>
          </Link>
          <nav className="flex-1 space-y-1">
            {items.map((it) => {
              const active = loc.pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-brand text-primary-foreground glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <it.icon className="size-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="glass mt-4 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-brand">
                <UserCircle className="size-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.user_metadata?.full_name ?? user?.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student"}
                </p>
              </div>
              <button
                onClick={() => signOut().then(() => nav({ to: "/" }))}
                className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-30 glass-strong px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-brand">
              <Car className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Paco</span>
          </Link>
          <button
            onClick={() => signOut().then(() => nav({ to: "/" }))}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        {/* Main */}
        <main className="min-w-0 flex-1 pt-16 lg:pt-0 pb-24 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-strong px-2 py-2 flex items-center justify-around">
        {items.slice(0, 5).map((it) => {
          const active = loc.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <it.icon className="size-5" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
