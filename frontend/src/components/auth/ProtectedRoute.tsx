import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that redirects unauthenticated users to login page.
 * Wraps routes that require authentication.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state from sessionStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
