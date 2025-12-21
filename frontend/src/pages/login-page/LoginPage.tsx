import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, User, Lock, Moon, Sun } from "lucide-react";
import { useTheme, useAuth } from "../../contexts";
import { loginUser } from "../../api/authApi";
import { useToast, ToastContainer } from "../../components/alert-feedback";
import { LoginTransition, type LoginState } from "../../components/auth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
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

      if (response.success && response.data && response.data.token) {
        // Store user data and JWT token in AuthContext
        login(response.data.user, response.data.token);

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
          response.error || "שם משתמש או סיסמה שגויים"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginState("error");
      showError("שגיאה", "אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר.");
    }
  };

  const isLoading = loginState === "loading";

  return (
    <>
      {/* Login Transition Overlay */}
      <LoginTransition
        state={loginState}
        isDarkMode={isDarkMode}
        userName={loggedInUserName}
      />

      <div
        className={`
          min-h-screen flex items-center justify-center
          px-4 py-8
          transition-all duration-500
          ${
            loginState !== "idle" && loginState !== "error"
              ? "opacity-0 scale-95"
              : "opacity-100 scale-100"
          }
          ${
            isDarkMode
              ? "bg-slate-900"
              : "bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100"
          }
        `}
      >
        {/* Login Card */}
        <div
          className={`
            w-full max-w-md
            p-8 md:p-10
            rounded-3xl shadow-2xl
            transform transition-all duration-500 ease-out
            ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"}
          `}
        >
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`
                p-4 rounded-2xl
                transition-all duration-300
                ${isDarkMode ? "bg-blue-500/10" : "bg-blue-50"}
              `}
            >
              <Layers size={40} className="text-blue-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h1
            className={`
              text-center text-3xl md:text-4xl font-bold mb-3
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            ברוכים הבאים
          </h1>

          {/* Subtitle */}
          <p
            className={`
              text-center text-sm mb-8
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
          >
            הזן את פרטיך כדי להיכנס אל{" "}
            <span className="font-semibold text-blue-600">
              {import.meta.env.VITE_SYSTEM_NAME || "Flow Task"}
            </span>
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="transform transition-all duration-200 hover:translate-x-[-2px]">
              <label
                htmlFor="username"
                className={`
                  block text-sm font-medium mb-2 text-right
                  ${isDarkMode ? "text-slate-300" : "text-slate-700"}
                `}
              >
                שם משתמש
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="הקלד שם משתמש"
                  autoComplete="off"
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-3.5 pr-12
                    rounded-xl border-2
                    text-right
                    transition-all duration-200
                    ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }
                    focus:outline-none focus:ring-4 focus:ring-blue-500/20
                    disabled:opacity-50
                  `}
                  required
                />
                <User
                  size={20}
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2
                    transition-colors duration-200
                    ${isDarkMode ? "text-slate-400" : "text-slate-400"}
                  `}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="transform transition-all duration-200 hover:translate-x-[-2px]">
              <label
                htmlFor="password"
                className={`
                  block text-sm font-medium mb-2 text-right
                  ${isDarkMode ? "text-slate-300" : "text-slate-700"}
                `}
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הקלד סיסמה"
                  autoComplete="off"
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-3.5 pr-12
                    rounded-xl border-2
                    text-right
                    transition-all duration-200
                    ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }
                    focus:outline-none focus:ring-4 focus:ring-blue-500/20
                    disabled:opacity-50
                  `}
                  required
                />
                <Lock
                  size={20}
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2
                    transition-colors duration-200
                    ${isDarkMode ? "text-slate-400" : "text-slate-400"}
                  `}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 px-6 mt-2
                bg-gradient-to-r from-blue-600 to-blue-700
                hover:from-blue-700 hover:to-blue-800
                text-white font-bold text-base
                rounded-xl
                transition-all duration-300
                shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-[1.02] active:scale-[0.98]"
                }
              `}
            >
              התחבר למערכת
            </button>
          </form>
        </div>

        {/* Dark Mode Toggle - Bottom Left Corner */}
        <button
          onClick={toggleDarkMode}
          className={`
            fixed bottom-6 left-6
            p-3.5 rounded-full
            shadow-lg border-2
            transition-all duration-300
            hover:scale-110 hover:rotate-12
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }
          `}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun size={22} className="text-yellow-400" />
          ) : (
            <Moon size={22} className="text-slate-600" />
          )}
        </button>

        {/* Toast Notifications */}
        <ToastContainer
          alerts={alerts}
          onDismiss={dismissAlert}
          isDarkMode={isDarkMode}
        />
      </div>
    </>
  );
};

export default LoginPage;
