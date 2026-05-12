import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/backend/lib/auth-context";
import { authAPI } from "@/lib/api-client";
import { toast } from "sonner";
import { Car, UserCog, GraduationCap } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, checkSession } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // If already authenticated, redirect to appropriate dashboard
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleRoleLogin = async (role: 'admin' | 'student') => {
    setLoading(true);
    try {
      let credentials;
      
      if (role === 'admin') {
        credentials = { email: 'admin@immacurate.co.ke', password: 'Admin123!' };
      } else {
        // For student demo, try multiple possible accounts
        credentials = { email: 'faith.wambu.matinda@drivingschool.com', password: 'student123' };
      }
      
      await authAPI.login(credentials.email, credentials.password);
      await checkSession(); // Update auth context
      toast.success(`Welcome ${role}!`);
      
      // Navigate based on role
      if (role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (role === 'student') {
        toast.error('Student demo account not set up yet. Please use admin access for now.');
      } else {
        toast.error(`Failed to login as ${role}. Please check your credentials.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 md:p-12"
        style={{ background: "linear-gradient(135deg, #1a2744 0%, #8b1a1a 60%, #1e3a8a 100%)" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <Car className="size-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">WE ZOMBIE</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome to WE ZOMBIE
            <br />
            Driving School
          </h1>
          <p className="text-lg text-white/80">
            Choose your access level to get started with our comprehensive driving education platform.
          </p>
        </div>

        <div className="text-sm text-white/60">
          © 2024 WE ZOMBIE Driving School. All rights reserved.
        </div>
      </div>

      {/* Right panel — role selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to WE ZOMBIE</h2>
            <p className="mt-2 text-gray-600">
              Choose your access level to get started
            </p>
          </div>

          <div className="space-y-4">
            {/* Admin Access Button */}
            <button
              onClick={() => handleRoleLogin('admin')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              <UserCog className="size-8" />
              <div className="text-left">
                <div className="text-xl font-semibold">Administrator</div>
                <div className="text-blue-100 text-sm">Manage school operations</div>
              </div>
              <div className="ml-auto">
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Ready</div>
              </div>
            </button>

            {/* Student Access Button */}
            <button
              onClick={() => handleRoleLogin('student')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <GraduationCap className="size-8" />
              <div className="text-left">
                <div className="text-xl font-semibold">Student</div>
                <div className="text-gray-100 text-sm">Access your courses</div>
              </div>
              <div className="ml-auto">
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Demo</div>
              </div>
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Logging in...
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>Click on your role to automatically access the system</p>
            <p className="text-xs">
              <span className="inline-flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Admin access is fully configured
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Student access in demo mode
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}