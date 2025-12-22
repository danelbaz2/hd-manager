import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, useSettings } from "../contexts";
import { GlobalLoader } from "../components/loaders";

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
    return <GlobalLoader fullScreen />;
  }

  // Check if there's a stored token even if isAuthenticated is false
  // This handles the case where auth check had a transient error (network/abort)
  // but the token is still valid in storage
  const hasStoredToken = sessionStorage.getItem("auth_token") !== null;

  if (!isAuthenticated && !hasStoredToken) {
    // No valid session and no stored token - redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthenticated && hasStoredToken) {
    // There's a stored token but auth check failed (likely transient error)
    // Show loader and let the AuthContext retry mechanism work
    // This prevents false redirects during quick page refreshes
    return <GlobalLoader fullScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
