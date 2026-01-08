import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import { loginUser } from "../../api/authApi";
import { useToast } from "../../components/alert-feedback";
import { type LoginState } from "../../auth";

interface UseLoginFormReturn {
  // Form state
  username: string;
  password: string;
  loginState: LoginState;
  loggedInUserName: string;
  isLoading: boolean;

  // Form handlers
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;

  // Toast state and handlers
  alerts: ReturnType<typeof useToast>["alerts"];
  dismissAlert: ReturnType<typeof useToast>["dismissAlert"];
}

const useLoginForm = (): UseLoginFormReturn => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const { alerts, showError, dismissAlert } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      showError("שגיאה", "נא למלא את כל השדות");
      return;
    }

    setLoginState("loading");

    try {
      const response = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      if (response.success && response.data) {
        // Store user data in AuthContext (JWT cookie is already set by server)
        login(response.data.user);

        // Set user name for success message
        setLoggedInUserName(response.data.user.fullName || username);
        setLoginState("success");

        // Navigate after showing success animation
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Authentication failed
        setLoginState("error");
        showError(
          "שגיאת התחברות",
          "שם משתמש או סיסמה שגויים"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginState("error");
      showError("שגיאה", "אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר.");
    }
  };

  const isLoading = loginState === "loading";

  return {
    username,
    password,
    loginState,
    loggedInUserName,
    isLoading,
    setUsername,
    setPassword,
    handleSubmit,
    alerts,
    dismissAlert,
  };
};

export default useLoginForm;
