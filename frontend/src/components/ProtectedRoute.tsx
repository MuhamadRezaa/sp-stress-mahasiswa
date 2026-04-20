import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe, getToken, User } from "../api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireCompleteProfile?: boolean;
}

// Routes that student can access even without a complete profile
const PROFILE_EXEMPT_PATHS = ["/profile"];

function isStudentProfileComplete(user: User): boolean {
  return !!(
    user.gender &&
    user.age &&
    user.university &&
    user.major &&
    user.semester &&
    user.residential_status
  );
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Profile completion gate: only for students on non-exempt pages
  const isExemptPath = PROFILE_EXEMPT_PATHS.some((p) => location.pathname.startsWith(p));
  if (user?.role === "student" && !isExemptPath && !isStudentProfileComplete(user)) {
    return (
      <Navigate
        to="/profile"
        state={{ requiresProfileCompletion: true }}
        replace
      />
    );
  }

  return <>{children}</>;
}
