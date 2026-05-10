import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { signupFn } from "@/backend/lib/auth-server";
import { toast } from "sonner";
import { Car, Eye, EyeOff, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const { isAuthenticated, checkSession } = useAuth();
  const [fullName, setFullName] = useState("");
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
    
    try {
      await signupFn({ data: { email, password, fullName } });
      await checkSession();
      toast.success("Account created successfully! Welcome.");
      nav({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1a2744 50%, #8b1a1a 100%)" }}
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
            Start your driving
            <br />
            <span style={{ color: "#f59e0b" }}>journey today</span>
          </h2>
          <p className="mt-4 text-blue-200 text-lg">
            Create your free student account and get access to your personalised learning portal.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { title: "Free to create", desc: "No upfront cost to register" },
              { title: "Instant access", desc: "Start exploring courses immediately" },
              { title: "Track everything", desc: "Progress, schedule, and payments in one place" },
              { title: "Secure & private", desc: "Your data is protected and never shared" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle className="size-5 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-blue-300">{item.desc}</p>
                </div>
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
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #8b1a1a, #1e3a8a)" }}
              >
                <Car className="size-4 text-white" />
              </div>
              <span className="font-display text-base font-bold text-gray-900">Taco DS</span>
            </Link>
          </div>

          <div>
            <h1 className="font-display text-3xl font-black text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "#8b1a1a" }}>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="form-input"
              />
            </div>

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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
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
                  Creating account…
                </span>
              ) : (
                "Create Free Account"
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By creating an account you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
