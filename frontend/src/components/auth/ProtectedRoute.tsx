import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full animate-bounce bg-blue-500 dark:bg-blue-400"
            style={{ animationDelay: "0ms", animationDuration: "600ms" }}
          />
          <div
            className="w-4 h-4 rounded-full animate-bounce bg-blue-500 dark:bg-blue-400"
            style={{ animationDelay: "150ms", animationDuration: "600ms" }}
          />
          <div
            className="w-4 h-4 rounded-full animate-bounce bg-blue-500 dark:bg-blue-400"
            style={{ animationDelay: "300ms", animationDuration: "600ms" }}
          />
        </div>
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
