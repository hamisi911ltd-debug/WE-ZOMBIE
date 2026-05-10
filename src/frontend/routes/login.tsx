import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/backend/integrations/supabase/client";
import { useAuth } from "@/backend/lib/auth-context";
import { toast } from "sonner";
import { Car, Eye, EyeOff, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) nav({ to: "/dashboard" });
  }, [isAuthenticated, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Invalid credentials. Please check your email and password.");
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1a2744 0%, #8b1a1a 60%, #1e3a8a 100%)" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Car className="size-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white leading-none">Taco Driving School</p>
            <p className="text-xs text-blue-200 leading-none mt-0.5">Professional Driver Training</p>
          </div>
        </Link>

        <div>
          <h2 className="font-display text-4xl font-black text-white leading-tight">
            Welcome back to your
            <br />
            <span style={{ color: "#f59e0b" }}>learning portal</span>
          </h2>
          <p className="mt-4 text-blue-200 text-lg">
            Track your progress, view your schedule, and manage your driving journey — all in one place.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "View your course progress",
              "Check upcoming lesson schedule",
              "Download payment receipts",
              "Access learning materials",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(245,158,11,0.25)" }}
                >
                  <div className="size-2 rounded-full" style={{ background: "#f59e0b" }} />
                </div>
                <p className="text-sm text-blue-100">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-blue-300">
          © {new Date().getFullYear()} Taco Driving School
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
              >
                <Car className="size-4 text-white" />
              </div>
              <span className="font-display text-base font-bold text-gray-900">Taco DS</span>
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="size-4" /> Back
            </Link>
          </div>

          <div>
            <h1 className="font-display text-3xl font-black text-gray-900">Sign in</h1>
            <p className="mt-2 text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: "#8b1a1a" }}>
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs font-medium hover:underline" style={{ color: "#8b1a1a" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full justify-center"
              style={{ padding: "0.875rem", fontSize: "0.9375rem" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in to Portal"
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Admin Access
            </p>
            <p className="text-sm text-gray-600">
              School administrators use the same login. Your role determines what you see after signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
