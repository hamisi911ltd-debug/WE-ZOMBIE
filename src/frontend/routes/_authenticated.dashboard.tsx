import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { useEnrollments } from "@/frontend/hooks/use-enrollments";
import { useLessonProgress } from "@/frontend/hooks/use-lesson-progress";
import { useScheduleEntries } from "@/frontend/hooks/use-schedule";
import { calculateCompletionPercentage } from "@/backend/lib/completion";
import { getNextLesson } from "@/backend/lib/schedule";
import { EnrollStudentForm } from "@/frontend/components/EnrollStudentForm";
import { PaymentForm } from "@/frontend/components/PaymentForm";
import {
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboardStatsFn,
  getAdminCountFn,
  claimFirstAdminFn,
  getStudentCourseStatsFn,
} from "@/backend/lib/api-dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-black text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-xs font-medium" style={{ color: "#059669" }}>
              {trend}
            </p>
          )}
        </div>
        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className="size-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const [stats, setStats] = useState({
    enrolledStudents: 0,
    activeCourses: 0,
    pendingPayments: 0,
    upcomingEntries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: string; type: "payment" | "enrollment"; label: string; sub: string; time: string; status?: string }>
  >([]);
  const [enrollFormOpen, setEnrollFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  useEffect(() => {
    getDashboardStatsFn().then((data) => {
      setStats(data.stats);
      const activity: typeof recentActivity = [];

      for (const p of data.recentPayments) {
        activity.push({
          id: p.id,
          type: "payment",
          label: `Payment — $${Number(p.amount).toFixed(2)}`,
          sub: `Student ${p.userId.slice(0, 8)}…`,
          time: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          status: p.status,
        });
      }

      for (const e of data.recentEnrollments) {
        activity.push({
          id: e.id,
          type: "enrollment",
          label: `New Enrollment`,
          sub: `Student ${e.userId.slice(0, 8)}…`,
          time: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          status: e.status,
        });
      }

      activity.sort((a, b) => b.time.localeCompare(a.time));
      setRecentActivity(activity.slice(0, 6));
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Enrolled Students"
          value={stats.enrolledStudents}
          icon={Users}
          iconBg="#dbeafe"
          iconColor="#1d4ed8"
        />
        <StatCard
          label="Active Courses"
          value={stats.activeCourses}
          icon={GraduationCap}
          iconBg="#fee2e2"
          iconColor="#8b1a1a"
        />
        <StatCard
          label="Pending Payments"
          value={stats.pendingPayments}
          icon={CreditCard}
          iconBg={stats.pendingPayments > 0 ? "#fef3c7" : "#f1f5f9"}
          iconColor={stats.pendingPayments > 0 ? "#b45309" : "#64748b"}
        />
        <StatCard
          label="Upcoming (7 days)"
          value={stats.upcomingEntries}
          icon={Calendar}
          iconBg="#dcfce7"
          iconColor="#15803d"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="section-title text-base mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setEnrollFormOpen(true)}
              className="admin-card-hover w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "#fee2e2" }}>
                <Plus className="size-5" style={{ color: "#8b1a1a" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Enroll Student</p>
                <p className="text-xs text-gray-500">Create account + assign course</p>
              </div>
              <ArrowRight className="size-4 text-gray-400 shrink-0" />
            </button>

            <Link
              to="/courses"
              className="admin-card-hover flex items-center gap-3 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "#dbeafe" }}>
                <BookOpen className="size-5" style={{ color: "#1d4ed8" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Manage Courses</p>
                <p className="text-xs text-gray-500">Add or edit curriculum</p>
              </div>
              <ArrowRight className="size-4 text-gray-400 shrink-0" />
            </Link>

            <button
              onClick={() => setPaymentFormOpen(true)}
              className="admin-card-hover w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "#fef3c7" }}>
                <CreditCard className="size-5" style={{ color: "#b45309" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Log Payment</p>
                <p className="text-xs text-gray-500">Record a fee or receipt</p>
              </div>
              <ArrowRight className="size-4 text-gray-400 shrink-0" />
            </button>

            <Link
              to="/schedule"
              className="admin-card-hover flex items-center gap-3 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "#dcfce7" }}>
                <Calendar className="size-5" style={{ color: "#15803d" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Schedule Lesson</p>
                <p className="text-xs text-gray-500">Assign instructor & time</p>
              </div>
              <ArrowRight className="size-4 text-gray-400 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-base">Recent Activity</h2>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#8b1a1a" }}>
              <Activity className="size-3.5" />
              Live
            </div>
          </div>
          <div className="admin-card overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="mx-auto size-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: item.type === "payment" ? "#fef3c7" : "#dbeafe",
                      }}
                    >
                      {item.type === "payment" ? (
                        <CreditCard className="size-4" style={{ color: "#b45309" }} />
                      ) : (
                        <CheckCircle2 className="size-4" style={{ color: "#1d4ed8" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">{item.sub}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{item.time}</p>
                      {item.status && (
                        <span
                          className={`badge text-[10px] mt-0.5 ${
                            item.status === "paid" || item.status === "active"
                              ? "badge-green"
                              : item.status === "pending"
                              ? "badge-amber"
                              : "badge-gray"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div>
        <h2 className="section-title text-base mb-4">Manage</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/courses", icon: GraduationCap, label: "Courses", desc: "Build curriculum", bg: "#fee2e2", color: "#8b1a1a" },
            { to: "/students", icon: Users, label: "Students", desc: "Manage enrolments", bg: "#dbeafe", color: "#1d4ed8" },
            { to: "/payments", icon: CreditCard, label: "Payments", desc: "Track fees & receipts", bg: "#fef3c7", color: "#b45309" },
            { to: "/schedule", icon: Calendar, label: "Schedule", desc: "Timetables & lessons", bg: "#dcfce7", color: "#15803d" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="admin-card-hover group flex flex-col p-5"
            >
              <div
                className="flex size-11 items-center justify-center rounded-xl mb-3"
                style={{ background: item.bg }}
              >
                <item.icon className="size-5" style={{ color: item.color }} />
              </div>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: item.color }}>
                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <EnrollStudentForm open={enrollFormOpen} onOpenChange={setEnrollFormOpen} />
      <PaymentForm open={paymentFormOpen} onOpenChange={setPaymentFormOpen} />
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data: enrollments = [] } = useEnrollments(userId);
  const { data: scheduleEntries = [] } = useScheduleEntries(userId, "student");

  const activeEnrollment = enrollments.find((e) => e.status === "active");
  const courseId = activeEnrollment?.courseId ?? "";

  const { data: progressRecords = [] } = useLessonProgress(userId, courseId);

  const [totalLessons, setTotalLessons] = useState(0);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    if (!courseId) return;
    getStudentCourseStatsFn({ data: courseId }).then((data) => {
      if (data) {
        setCourseName(data.title);
        setTotalLessons(data.totalLessons);
      }
    });
  }, [courseId]);

  const completedCount = progressRecords.filter((p) => p.completed).length;
  const completionPct = calculateCompletionPercentage(completedCount, totalLessons);
  const nextLesson = getNextLesson(scheduleEntries, new Date());

  const formatCountdown = (entry: any) => {
    if (!entry) return null;
    const entryTime = new Date(`${entry.scheduledDate}T${entry.startTime}`);
    const diff = entryTime.getTime() - Date.now();
    if (diff <= 0) return "Now";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div
        className="rounded-xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #1a2744 0%, #8b1a1a 100%)" }}
      >
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>
          Welcome back
        </p>
        <h2 className="mt-1 font-display text-2xl font-black">
          {user?.fullName ?? user?.email}
        </h2>
        {courseName && (
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.70)" }}>
            Enrolled in: <span className="font-semibold text-white">{courseName}</span>
          </p>
        )}
      </div>

      {/* Progress + Next lesson */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Course completion */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "#fee2e2" }}>
              <TrendingUp className="size-4" style={{ color: "#8b1a1a" }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Course Progress</p>
          </div>
          {courseId ? (
            <>
              <div className="flex items-end justify-between mb-2">
                <p className="font-display text-4xl font-black text-gray-900">{completionPct}%</p>
                <p className="text-sm text-gray-500 mb-1">{completedCount}/{totalLessons} lessons</p>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPct}%` }} />
              </div>
              <Link
                to="/courses"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "#8b1a1a" }}
              >
                Continue learning <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="mx-auto size-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active enrollment</p>
              <p className="text-xs text-gray-400 mt-1">Contact your school to get enrolled</p>
            </div>
          )}
        </div>

        {/* Next lesson */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "#dbeafe" }}>
              <Clock className="size-4" style={{ color: "#1d4ed8" }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Next Lesson</p>
          </div>
          {nextLesson ? (
            <>
              <p className="font-display text-4xl font-black text-gray-900">{formatCountdown(nextLesson)}</p>
              <p className="mt-2 text-sm text-gray-500">
                {new Date(nextLesson.scheduledDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {formatTime(nextLesson.startTime)} – {formatTime(nextLesson.endTime)}
              </p>
              <Link
                to="/schedule"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "#1d4ed8" }}
              >
                View schedule <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <Calendar className="mx-auto size-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No upcoming lessons</p>
              <p className="text-xs text-gray-400 mt-1">Your instructor will schedule your next session</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="section-title text-base mb-4">My Portal</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/courses", icon: GraduationCap, label: "My Course", desc: "Continue your lessons", bg: "#fee2e2", color: "#8b1a1a" },
            { to: "/payments", icon: CreditCard, label: "Payments", desc: "View history & receipts", bg: "#fef3c7", color: "#b45309" },
            { to: "/schedule", icon: Calendar, label: "Schedule", desc: "Upcoming lessons", bg: "#dbeafe", color: "#1d4ed8" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="admin-card-hover group flex items-center gap-4 p-4"
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: item.bg }}
              >
                <item.icon className="size-5" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <ArrowRight className="size-4 text-gray-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard() {
  const { user, roles, hasRole, refreshRoles } = useAuth();
  const isAdmin = hasRole("admin");
  const isInstructor = hasRole("instructor");
  const [adminCount, setAdminCount] = useState<number | null>(null);

  useEffect(() => {
    getAdminCountFn().then((count) => setAdminCount(count));
  }, [roles]);

  const claimAdmin = async () => {
    const res = await claimFirstAdminFn();
    if (res.success) {
      toast.success("You are now the Admin.");
      await refreshRoles();
    } else {
      toast.error(res.message || "An admin already exists.");
    }
  };

  const roleLabel = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";

  return (
    <div>
      {/* Page header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="section-subtitle">
            {isAdmin
              ? "Overview of school operations and quick actions"
              : "Your learning progress and upcoming schedule"}
          </p>
        </div>
        <span className="badge badge-blue">{roleLabel}</span>
      </div>

      {/* Claim admin banner */}
      {!isAdmin && adminCount === 0 && (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"
          style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#f59e0b" }}>
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Set yourself as the school admin</p>
              <p className="text-sm text-gray-600">No admin exists yet. Claim it to start managing the school.</p>
            </div>
          </div>
          <button onClick={claimAdmin} className="btn-brand">
            Become Admin
          </button>
        </div>
      )}

      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
}

