import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  placeholder: string;
  showPassword: boolean;
  isDarkMode: boolean;
  isDisabled?: boolean;
  onTogglePassword: () => void;
  onChange: (value: string) => void;
}

/**
 * PasswordInput - Password input field with visibility toggle
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  placeholder,
  showPassword,
  isDarkMode,
  isDisabled = false,
  onTogglePassword,
  onChange,
}) => {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        className={`
          w-full px-4 py-2.5 pl-10
          rounded-lg border text-right
          transition-colors
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        disabled={isDisabled}
        className={`
          absolute left-2 top-1/2 -translate-y-1/2
          p-1 rounded-md transition-colors
          ${
            isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }
        `}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
