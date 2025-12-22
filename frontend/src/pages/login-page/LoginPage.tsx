import React from "react";
import { useTheme } from "../../contexts";
import { ToastContainer } from "../../components/alert-feedback";
import { LoginTransition } from "../../auth";
import LoginCard from "./LoginCard";
import DarkModeToggle from "./DarkModeToggle";
import useLoginForm from "./useLoginForm";

const LoginPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
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
  } = useLoginForm();

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
        <LoginCard
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
        />

        {/* Dark Mode Toggle */}
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

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
