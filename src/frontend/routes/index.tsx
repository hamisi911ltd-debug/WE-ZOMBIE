import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/backend/lib/auth-context";
import {
  GraduationCap,
  CreditCard,
  Calendar,
  Users,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowRight,
  Car,
  Shield,
  Clock,
  Award,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Navigation ── */}
      <nav className="public-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
            >
              <Car className="size-5 text-white" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-none text-gray-900">
                Taco Driving School
              </p>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                Professional Driver Training
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Courses
            </a>
            <a href="#why-us" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Why Us
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-brand"
              >
                My Portal <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-outline hidden sm:inline-flex"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-brand"
                >
                  Enroll Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a2744 0%, #8b1a1a 55%, #1e3a8a 100%)" }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                style={{ background: "rgba(245,158,11,0.20)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.30)" }}
              >
                <Award className="size-4" />
                Certified Driving Instructors
              </div>
              <h1
                className="font-display text-5xl font-black leading-tight text-white lg:text-6xl"
                style={{ letterSpacing: "-0.03em" }}
              >
                Learn to Drive with{" "}
                <span className="hero-text-red-800">Confidence</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-blue-100">
                Taco Driving School offers professional driver training for all licence categories.
                Our certified instructors guide you from beginner to road-ready with structured
                courses, flexible scheduling, and a proven track record.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn-brand" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
                  {isAuthenticated ? "Go to My Portal" : "Start Your Journey"}
                  <ArrowRight className="size-5" />
                </Link>
                <a
                  href="#courses"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold text-white transition"
                  style={{ border: "2px solid rgba(255,255,255,0.30)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  View Courses
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { value: "500+", label: "Students Trained" },
                  { value: "98%", label: "Pass Rate" },
                  { value: "10+", label: "Years Experience" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-3xl font-black text-white">{s.value}</p>
                    <p className="mt-1 text-sm text-blue-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image / card */}
            <div className="hidden lg:block">
              <div
                className="rounded-xl p-8"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", backdropFilter: "blur(12px)" }}
              >
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-4">
                  Student Portal Preview
                </p>
                {/* Mock dashboard card */}
                <div className="space-y-3">
                  {[
                    { icon: GraduationCap, label: "Category B – Light Private", sub: "Module 3 of 8 in progress", color: "#f59e0b" },
                    { icon: Calendar, label: "Next Lesson: Tomorrow 10:00 AM", sub: "Instructor: John Smith", color: "#34d399" },
                    { icon: CreditCard, label: "Payment Due: $450", sub: "Due in 5 days", color: "#60a5fa" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: item.color + "22" }}
                      >
                        <item.icon className="size-4" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-blue-200">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                  {/* Progress bar */}
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">Course Progress</p>
                      <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>37%</p>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "37%" }} />
                    </div>
                    <p className="mt-1.5 text-xs text-blue-200">3 of 8 modules completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-b border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              { icon: Shield, text: "Fully Licensed & Insured" },
              { icon: Award, text: "Certified Instructors" },
              { icon: Clock, text: "Flexible Scheduling" },
              { icon: CheckCircle, text: "98% First-Time Pass Rate" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="size-4" style={{ color: "#8b1a1a" }} />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ── */}
      <section id="courses" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8b1a1a" }}>
              Our Programmes
            </p>
            <h2 className="mt-2 font-display text-4xl font-black text-gray-900">
              Driving Courses for Every Level
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              From first-time drivers to advanced licence categories — we have a structured
              programme to get you road-ready.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Category B – Light Private",
                tag: "Most Popular",
                tagColor: "#8b1a1a",
                desc: "The standard car licence. Theory + practical training covering all road rules, hazard perception, and vehicle control.",
                features: ["20 theory lessons", "30 practical hours", "Mock test included"],
                price: "From $1,200",
                color: "#8b1a1a",
              },
              {
                title: "Category C – Heavy Goods",
                tag: "Professional",
                tagColor: "#1e3a8a",
                desc: "Truck and heavy goods vehicle licence. Ideal for those pursuing a career in logistics and transport.",
                features: ["Advanced theory", "40 practical hours", "Route planning"],
                price: "From $2,400",
                color: "#1e3a8a",
              },
              {
                title: "Defensive Driving",
                tag: "Advanced",
                tagColor: "#d97706",
                desc: "Sharpen your skills with advanced defensive driving techniques. Suitable for all licence holders.",
                features: ["Hazard awareness", "Emergency manoeuvres", "Certificate issued"],
                price: "From $600",
                color: "#d97706",
              },
            ].map((course) => (
              <div key={course.title} className="feature-card flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl"
                    style={{ background: course.color + "15" }}
                  >
                    <GraduationCap className="size-6" style={{ color: course.color }} />
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: course.tagColor + "15", color: course.tagColor }}
                  >
                    {course.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-500 flex-1">{course.desc}</p>
                <ul className="mt-4 space-y-2">
                  {course.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="size-4 shrink-0" style={{ color: course.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <p className="font-display text-lg font-bold" style={{ color: course.color }}>
                    {course.price}
                  </p>
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/signup"}
                    className="inline-flex items-center gap-1 text-sm font-semibold transition"
                    style={{ color: course.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.gap = "0.5rem")}
                  >
                    Enroll <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" className="py-20" style={{ background: "#f8fafc" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8b1a1a" }}>
                Why Choose Us
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-gray-900">
                The Taco Driving School Difference
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                We combine experienced instructors, modern vehicles, and a digital-first
                student portal to give you the best learning experience.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: Users,
                    title: "Expert Instructors",
                    desc: "All instructors are government-certified with 5+ years of teaching experience.",
                    color: "#8b1a1a",
                  },
                  {
                    icon: Calendar,
                    title: "Flexible Scheduling",
                    desc: "Book lessons at times that suit you — mornings, evenings, and weekends available.",
                    color: "#1e3a8a",
                  },
                  {
                    icon: GraduationCap,
                    title: "Structured Curriculum",
                    desc: "Our courses follow a proven step-by-step curriculum aligned with national standards.",
                    color: "#d97706",
                  },
                  {
                    icon: Shield,
                    title: "Student Portal",
                    desc: "Track your progress, view your schedule, and manage payments — all in one place.",
                    color: "#059669",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: item.color + "15" }}
                    >
                      <item.icon className="size-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: "Students Trained", color: "#8b1a1a" },
                { value: "98%", label: "Pass Rate", color: "#1e3a8a" },
                { value: "15+", label: "Instructors", color: "#d97706" },
                { value: "10+", label: "Years Active", color: "#059669" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-6 text-center"
                  style={{ background: s.color + "08", border: `1px solid ${s.color}20` }}
                >
                  <p className="font-display text-4xl font-black" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8b1a1a" }}>
              Student Reviews
            </p>
            <h2 className="mt-2 font-display text-4xl font-black text-gray-900">
              What Our Students Say
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah M.",
                course: "Category B",
                text: "Passed first time! The structured lessons and patient instructors made all the difference. The online portal made it easy to track my progress.",
                rating: 5,
              },
              {
                name: "James K.",
                course: "Category C",
                text: "Professional service from start to finish. The scheduling system is brilliant — I could book lessons around my work shifts easily.",
                rating: 5,
              },
              {
                name: "Priya N.",
                course: "Defensive Driving",
                text: "The defensive driving course gave me so much confidence on the road. Highly recommend to anyone who wants to be a safer driver.",
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="feature-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" style={{ color: "#f59e0b" }} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.course} Graduate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-20"
        style={{ background: "linear-gradient(135deg, #1a2744 0%, #8b1a1a 100%)" }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-4xl font-black text-white lg:text-5xl">
            Ready to Get Your Licence?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join hundreds of successful drivers. Enroll today and start your journey to
            becoming a confident, safe driver.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-gray-900 transition"
              style={{ background: "#f59e0b" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d97706")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f59e0b")}
            >
              {isAuthenticated ? "Open My Portal" : "Enroll Now — It's Free"}
              <ArrowRight className="size-5" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white transition"
              style={{ border: "2px solid rgba(255,255,255,0.40)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8b1a1a" }}>
                Get In Touch
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-gray-900">
                Contact Taco Driving School
              </h2>
              <p className="mt-4 text-gray-500">
                Have questions about our courses or want to book a lesson? Reach out to us
                and we'll get back to you within 24 hours.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "+1 (555) 123-4567", sub: "Mon–Sat, 8am–6pm" },
                  { icon: Mail, label: "info@tacodriving.com", sub: "We reply within 24 hours" },
                  { icon: MapPin, label: "123 Driver Street, City, ST 12345", sub: "Main training centre" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "#8b1a1a15" }}
                    >
                      <item.icon className="size-5" style={{ color: "#8b1a1a" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="admin-card p-8">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" className="form-input" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" className="form-input" placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="form-input" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Interest</label>
                  <select className="form-input">
                    <option value="">Select a course…</option>
                    <option>Category B – Light Private</option>
                    <option>Category C – Heavy Goods</option>
                    <option>Defensive Driving</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="form-input" placeholder="Tell us how we can help…" />
                </div>
                <button type="submit" className="btn-brand w-full justify-center" style={{ padding: "0.75rem" }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1a2744" }}>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
                >
                  <Car className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-white">Taco Driving School</p>
                  <p className="text-xs text-blue-300">Professional Driver Training</p>
                </div>
              </div>
              <p className="text-sm text-blue-200 max-w-xs">
                Helping drivers gain confidence and competence on the road since 2014.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Quick Links</p>
              <ul className="space-y-2">
                {["Courses", "Why Us", "Testimonials", "Contact"].map((l) => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(" ", "-")}`} className="text-sm text-blue-300 hover:text-white transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Portal</p>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-sm text-blue-300 hover:text-white transition-colors">Student Login</Link></li>
                <li><Link to="/signup" className="text-sm text-blue-300 hover:text-white transition-colors">Create Account</Link></li>
                {isAuthenticated && (
                  <li><Link to="/dashboard" className="text-sm text-blue-300 hover:text-white transition-colors">My Dashboard</Link></li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
            <p className="text-center text-sm text-blue-300">
              © {new Date().getFullYear()} Taco Driving School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
