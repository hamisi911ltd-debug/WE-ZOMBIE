import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Car, GraduationCap, CreditCard, Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-xl bg-brand glow">
            <Car className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Paco</span>
        </Link>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/5">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground glow"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
              <Sparkles className="size-3.5" /> Driving School OS
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">
              Run your driving school like a <span className="text-gradient">pro</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Paco brings courses, modules, lessons, payments, and instructor schedules into one vibrant
              glass dashboard. Built for admins, instructors, and students.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground glow"
              >
                {isAuthenticated ? "Open dashboard" : "Create your school"}
              </Link>
              <Link
                to="/login"
                className="glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="glass-strong relative rounded-3xl p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: GraduationCap, title: "Nested Courses", desc: "Course → Module → Lesson with Theory / Practical tags." },
                { icon: CreditCard, title: "Payments", desc: "Log fees, upload bank proofs, generate receipts." },
                { icon: Calendar, title: "Schedules", desc: "Assign instructors, see personal timetables." },
                { icon: Sparkles, title: "Quick Add", desc: "Universal upload + add from anywhere." },
              ].map((f) => (
                <div key={f.title} className="glass rounded-2xl p-4">
                  <f.icon className="size-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
