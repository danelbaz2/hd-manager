import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getCurrentUser, logoutUser, type AuthUser } from "../api/authApi";

const MAX_RETRIES = 3;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if the component is still mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track retry attempts to prevent infinite loops
  const retryCountRef = useRef(0);

  // Helper to check if an error message indicates a network/abort issue (not auth failure)
  const isTransientError = useCallback((errorMessage: string): boolean => {
    const transientPatterns = [
      "abort",
      "aborted",
      "cancelled",
      "canceled",
      "failed to fetch",
      "networkerror",
      "network error",
      "network request failed",
      "load failed",
      "fetch failed",
      "connection",
      "timeout",
      "econnrefused",
      "enotfound",
    ];
    const lowerError = errorMessage.toLowerCase();
    return transientPatterns.some((pattern) => lowerError.includes(pattern));
  }, []);

  // Auth initialization function - validates session via cookie
  const initAuth = useCallback(async () => {
    try {
      // Attempt to fetch user data - cookie is sent automatically
      const response = await getCurrentUser();

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return;
      }

      if (response.success && response.data) {
        // Session is valid, set user
        setUser(response.data.user);
        retryCountRef.current = 0; // Reset retry count on success
        setIsLoading(false);
      } else {
        // API returned an error - check if it's a transient error or actual auth failure
        const errorMessage = response.error || "";

        if (isTransientError(errorMessage)) {
          // This is a network/abort error (likely from rapid refresh)
          console.warn(
            "Transient error during auth check, retrying:",
            errorMessage
          );

          // Retry after a short delay if we haven't exceeded max retries
          if (retryCountRef.current < MAX_RETRIES && isMountedRef.current) {
            retryCountRef.current++;
            console.log(
              `Retrying auth check (attempt ${retryCountRef.current}/${MAX_RETRIES})...`
            );
            setTimeout(() => {
              if (isMountedRef.current) {
                initAuth();
              }
            }, 1000); // Wait 1 second before retrying
          } else {
            // Max retries exceeded
            console.log("Max retries exceeded");
            setIsLoading(false);
          }
        } else {
          // This is an actual auth failure (no valid cookie/session)
          console.log("No valid session, user not authenticated");
          setIsLoading(false);
        }
      }
    } catch (error) {
      // This handles unexpected errors
      if (!isMountedRef.current) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (isTransientError(errorMessage)) {
        console.warn(
          "Transient error during auth check, retrying:",
          errorMessage
        );
        // Retry after a short delay
        if (retryCountRef.current < MAX_RETRIES && isMountedRef.current) {
          retryCountRef.current++;
          console.log(
            `Retrying auth check (attempt ${retryCountRef.current}/${MAX_RETRIES})...`
          );
          setTimeout(() => {
            if (isMountedRef.current) {
              initAuth();
            }
          }, 1000);
        } else {
          setIsLoading(false);
        }
      } else {
        console.error("Error loading auth state:", error);
        setIsLoading(false);
      }
    }
  }, [isTransientError]);

  // Validate session on mount
  useEffect(() => {
    // Reset mounted ref on each mount
    isMountedRef.current = true;
    retryCountRef.current = 0;

    initAuth();

    // Cleanup function - mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [initAuth]);

  // Called after successful login - just sets user state (cookie is set by backend)
  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
  }, []);

  // Logout - calls backend to clear cookie
  const logout = useCallback(async () => {
    // Call backend to clear the HttpOnly cookie
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    // Clear auth state
    setUser(null);

    // Note: We intentionally do NOT clear user storage on logout
    // Activity feed timestamps (lastViewedTeam, lastViewedTasks) should persist
    // so users don't see already-read items as "new" when they log back in
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

