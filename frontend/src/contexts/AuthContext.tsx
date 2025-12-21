import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getCurrentUser, type AuthUser } from "../api/authApi";

const AUTH_TOKEN_KEY = "auth_token";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from sessionStorage and fetch user from API on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);

        if (storedToken) {
          // Fetch user data from /me endpoint to verify token
          const response = await getCurrentUser(storedToken);

          if (response.success && response.data) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            // Token is invalid or expired, clear it
            console.log("Token invalid or expired, clearing session");
            sessionStorage.removeItem(AUTH_TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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
