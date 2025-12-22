import React from "react";
import { User, Lock } from "lucide-react";
import LoginInput from "./LoginInput";

interface LoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  isLoading,
  isDarkMode,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Username Field */}
      <LoginInput
        id="username"
        type="text"
        value={username}
        onChange={onUsernameChange}
        placeholder="הקלד שם משתמש"
        label="שם משתמש"
        icon={User}
        disabled={isLoading}
        isDarkMode={isDarkMode}
      />

      {/* Password Field */}
      <LoginInput
        id="password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="הקלד סיסמה"
        label="סיסמה"
        icon={Lock}
        disabled={isLoading}
        isDarkMode={isDarkMode}
      />

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
  );
};

export default LoginForm;
