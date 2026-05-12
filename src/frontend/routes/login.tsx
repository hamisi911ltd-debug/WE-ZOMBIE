import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { authAPI } from "@/lib/api-client";
import { toast } from "sonner";
import { Car, Eye, EyeOff, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  ssr: false, // Disable SSR
});

function LoginPage() {
  const nav = useNavigate();
  const { isAuthenticated, checkSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Login page - isAuthenticated:", isAuthenticated, "loading:", loading);
    if (!loading && isAuthenticated) {
      console.log("Already authenticated, redirecting to dashboard");
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Starting login...");
      
      // Login API call
      await authAPI.login(email, password);
      console.log("Login successful");
      
      // Update session and wait for it to complete
      await checkSession();
      console.log("Session updated");
      
      toast.success("Welcome back!");
      
      // Use a more reliable redirect method
      console.log("Redirecting to dashboard...");
      
      // Try multiple redirect methods for maximum compatibility
      try {
        // Method 1: TanStack Router navigation
        await nav({ to: "/dashboard", replace: true });
        console.log("TanStack navigation successful");
      } catch (navError) {
        console.log("TanStack navigation failed, trying window.location");
        // Method 2: Force page redirect as fallback
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials. Please check your email and password.");
      setLoading(false);
    }
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
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs font-medium hover:underline" style={{ color: "#8b1a1a" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
            
            {/* Debug information and manual navigation */}
            {isAuthenticated && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-700">✅ Login successful!</p>
                </div>
                <p className="text-xs text-green-600 mb-3">
                  If the page doesn't redirect automatically, click below:
                </p>
                <div className="space-y-2">
                  <Link 
                    to="/dashboard" 
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Go to Dashboard →
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.location.href = "/dashboard"}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Force Redirect to Dashboard
                  </button>
                </div>
              </div>
            )}
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
