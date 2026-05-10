import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { UniversalUploadButton } from "@/frontend/components/UniversalUploadButton";
import { ProfileModal } from "@/frontend/components/ProfileModal";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  UserCircle,
  Car,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, loading, user, roles, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) nav({ to: "/login" });
  }, [loading, isAuthenticated, nav]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <div className="spinner mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading your portal…</p>
        </div>
      </div>
    );
  }

  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/courses", label: "Courses", icon: GraduationCap },
    ...(isAdmin ? [{ to: "/students", label: "Students", icon: Users }] : []),
    { to: "/payments", label: "Payments", icon: CreditCard },
    { to: "/schedule", label: "Schedule", icon: Calendar },
  ] as const;

  const roleLabel = isAdmin ? "Administrator" : isInstructor ? "Instructor" : "Student";
  const userName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="admin-sidebar hidden lg:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
          >
            <Car className="size-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-white leading-tight truncate">
              Taco Driving School
            </p>
            <p className="text-[10px] leading-tight mt-0.5" style={{ color: "rgba(248,250,252,0.50)" }}>
              {roleLabel} Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p
            className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(248,250,252,0.35)" }}
          >
            Navigation
          </p>
          {navItems.map((item) => {
            const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-sidebar-item ${active ? "active" : ""}`}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="size-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition"
            style={{ background: "rgba(255,255,255,0.05)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
            >
              {userInitials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: "rgba(248,250,252,0.50)" }}>
                {roleLabel}
              </p>
            </div>
            <UserCircle className="size-4 shrink-0" style={{ color: "rgba(248,250,252,0.40)" }} />
          </button>

          <button
            onClick={() => signOut().then(() => nav({ to: "/" }))}
            className="mt-1 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
            style={{ color: "rgba(248,250,252,0.50)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220,38,38,0.15)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(248,250,252,0.50)";
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "#1a2744", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link to="/dashboard" className="flex items-center gap-2">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
          >
            <Car className="size-4 text-white" />
          </div>
          <span className="font-display text-sm font-bold text-white">Taco DS</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2" style={{ color: "rgba(248,250,252,0.60)" }}>
            <Bell className="size-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-white"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 admin-sidebar p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`admin-sidebar-item ${active ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => signOut().then(() => nav({ to: "/" }))}
                className="admin-sidebar-item w-full"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (desktop) */}
        <header
          className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 z-20"
          style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Portal</span>
            <ChevronRight className="size-3.5 text-gray-300" />
            <span className="font-semibold text-gray-900 capitalize">
              {loc.pathname.split("/").filter(Boolean)[0] ?? "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex size-9 items-center justify-center rounded-lg transition"
              style={{ border: "1px solid #e2e8f0" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Bell className="size-4 text-gray-500" />
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition"
              style={{ border: "1px solid #e2e8f0" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
              >
                {userInitials}
              </div>
              <span className="text-sm font-medium text-gray-700">{userName.split(" ")[0]}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 mt-14 lg:mt-0">
          <Outlet />
        </main>
      </div>

      <UniversalUploadButton />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
