import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getCurrentUser, logoutUser, type AuthUser } from "../api/auth.api";

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

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

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

  const initAuth = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      if (!isMountedRef.current) {
        return;
      }

      if (response.success && response.data) {
        setUser(response.data.user);
        retryCountRef.current = 0;
        setIsLoading(false);
      } else {
        const errorMessage = response.error || "";

        if (isTransientError(errorMessage)) {
          console.warn(
            "Transient error during auth check, retrying:",
            errorMessage,
          );

          if (retryCountRef.current < MAX_RETRIES && isMountedRef.current) {
            retryCountRef.current++;
            setTimeout(() => {
              if (isMountedRef.current) {
                initAuth();
              }
            }, 1000);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (isTransientError(errorMessage)) {
        console.warn(
          "Transient error during auth check, retrying:",
          errorMessage,
        );
        if (retryCountRef.current < MAX_RETRIES && isMountedRef.current) {
          retryCountRef.current++;
          console.log(
            `Retrying auth check (attempt ${retryCountRef.current}/${MAX_RETRIES})...`,
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

  useEffect(() => {
    isMountedRef.current = true;
    retryCountRef.current = 0;

    initAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, [initAuth]);

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
    }

    setUser(null);
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
