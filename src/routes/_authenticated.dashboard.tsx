import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Users, BookOpen, CreditCard, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="grid size-9 place-items-center rounded-xl bg-brand/20">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { user, roles, refreshRoles } = useAuth();
  const isAdmin = roles.includes("admin");
  const [stats, setStats] = useState({ courses: 0, modules: 0, lessons: 0, students: 0 });
  const [adminCount, setAdminCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .then(({ count }) => setAdminCount(count ?? 0));
  }, [roles]);

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("You are now the Admin.");
      await refreshRoles();
    } else {
      toast.error("An admin already exists.");
    }
  };

  useEffect(() => {
    (async () => {
      const [c, m, l, s] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("modules").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "student"),
      ]);
      setStats({
        courses: c.count ?? 0,
        modules: m.count ?? 0,
        lessons: l.count ?? 0,
        students: s.count ?? 0,
      });
    })();
  }, []);

  const greeting = isAdmin ? "Admin" : roles.includes("instructor") ? "Instructor" : "Student";
  const name = user?.user_metadata?.full_name ?? user?.email;

  return (
    <div className="space-y-8">
      <header className="glass-strong rounded-3xl p-8">
        <p className="text-sm text-muted-foreground">{greeting} dashboard</p>
        <h1 className="mt-1 font-display text-4xl font-bold">
          Hey, <span className="text-gradient">{name}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {isAdmin
            ? "Manage courses, students, payments, and schedules from one place."
            : "Track your progress, view your timetable, and continue learning."}
        </p>
      </header>

      {!isAdmin && adminCount === 0 && (
        <div className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand glow">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">Set yourself as the school admin</p>
              <p className="text-sm text-muted-foreground">
                No admin exists yet. Claim it to start building courses.
              </p>
            </div>
          </div>
          <button
            onClick={claimAdmin}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow"
          >
            Become Admin
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={stats.courses} icon={GraduationCap} />
        <StatCard label="Modules" value={stats.modules} icon={BookOpen} />
        <StatCard label="Lessons" value={stats.lessons} icon={BookOpen} />
        {isAdmin && <StatCard label="Students" value={stats.students} icon={Users} />}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link to="/courses" className="glass group rounded-2xl p-6 hover:bg-white/10 transition">
          <GraduationCap className="size-6 text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">Courses</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Build courses, modules, and lessons." : "Continue your enrolled courses."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
        <Link to="/payments" className="glass group rounded-2xl p-6 hover:bg-white/10 transition">
          <CreditCard className="size-6 text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">Payments</h3>
          <p className="mt-1 text-sm text-muted-foreground">Track fees, receipts and balances.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
        <Link to="/schedule" className="glass group rounded-2xl p-6 hover:bg-white/10 transition">
          <Calendar className="size-6 text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">Schedule</h3>
          <p className="mt-1 text-sm text-muted-foreground">Lessons & instructor timetables.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </div>
  );
}
