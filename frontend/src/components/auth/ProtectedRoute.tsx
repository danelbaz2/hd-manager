import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, useSettings } from "../../contexts";
import { GlobalLoader } from "../global-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that redirects unauthenticated users to login page.
 * Wraps routes that require authentication.
 * Shows a unified loader until BOTH auth AND data are fully loaded.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isDataLoading } = useSettings();
  const location = useLocation();

  // Show loading while checking auth state OR while initial data is being fetched
  // This provides a unified loading experience - only ONE loader for everything
  if (isAuthLoading || (isAuthenticated && isDataLoading)) {
    return (
      <GlobalLoader fullScreen />
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
