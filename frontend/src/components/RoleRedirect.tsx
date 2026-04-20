import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe, getToken, User } from "../api/auth";

/**
 * Komponen yang meredirect user ke dashboard yang sesuai
 * berdasarkan role mereka setelah login.
 */
export default function RoleRedirect() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        // Token invalid
      } finally {
        setIsLoading(false);
      }
    };
    checkRole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "pa") return <Navigate to="/pa" replace />;
  return <Navigate to="/student" replace />;
}
