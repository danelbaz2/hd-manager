import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getCurrentUser, type AuthUser } from "../api/authApi";

const AUTH_TOKEN_KEY = "auth_token";
const MAX_RETRIES = 3;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

  // Auth initialization function - can be called for retries
  const initAuth = useCallback(async () => {
    const storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);

    // No token stored, user is not logged in
    if (!storedToken) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Fetch user data from /me endpoint to verify token
      const response = await getCurrentUser(storedToken);

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        return;
      }

      if (response.success && response.data) {
        // Token is valid, set user and token
        setUser(response.data.user);
        setToken(storedToken);
        retryCountRef.current = 0; // Reset retry count on success
        setIsLoading(false);
      } else {
        // API returned an error - check if it's a transient error or actual auth failure
        const errorMessage = response.error || "";

        if (isTransientError(errorMessage)) {
          // This is a network/abort error (likely from rapid refresh)
          console.warn(
            "Transient error during auth check, keeping session:",
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
            // Max retries exceeded, but still keep the token - user can try refreshing
            console.log(
              "Max retries exceeded, but keeping token for user to retry"
            );
            setIsLoading(false);
          }
        } else {
          // This is an actual auth failure (token invalid, expired, etc.)
          console.log("Token invalid or expired, clearing session");
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
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
          "Transient error during auth check, keeping session:",
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
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        setIsLoading(false);
      }
    }
  }, [isTransientError]);

  // Load token from sessionStorage and fetch user from API on mount
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

  const login = useCallback((userData: AuthUser, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    // Only store the JWT token (not user data)
    sessionStorage.setItem(AUTH_TOKEN_KEY, authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const getToken = useCallback(() => {
    return token || sessionStorage.getItem(AUTH_TOKEN_KEY);
  }, [token]);

  const refreshUser = useCallback(async () => {
    const currentToken = token || sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!currentToken) return;

    try {
      const response = await getCurrentUser(currentToken);
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [token]);

  const isAuthenticated = user !== null && token !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        getToken,
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
