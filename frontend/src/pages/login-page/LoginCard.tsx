import React from "react";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

interface LoginCardProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const LoginCard: React.FC<LoginCardProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  isLoading,
  isDarkMode,
}) => {
  return (
    <div
      className={`
        w-full max-w-md
        p-8 md:p-10
        rounded-3xl shadow-2xl
        transform transition-all duration-500 ease-out
        ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"}
      `}
    >
      <LoginHeader isDarkMode={isDarkMode} />
      <LoginForm
        username={username}
        password={password}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default LoginCard;
