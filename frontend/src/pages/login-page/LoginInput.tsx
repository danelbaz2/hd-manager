import React, { type ElementType } from "react";

interface LoginInputProps {
  id: string;
  type: "text" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  icon: ElementType;
  disabled?: boolean;
  isDarkMode: boolean;
}

const LoginInput: React.FC<LoginInputProps> = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  disabled = false,
  isDarkMode,
}) => {
  return (
    <div className="transform transition-all duration-200 hover:translate-x-[-2px]">
      <label
        htmlFor={id}
        className={`
          block text-sm font-medium mb-2 text-right
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
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
        <Icon
          size={20}
          className={`
            absolute left-4 top-1/2 -translate-y-1/2
            transition-colors duration-200
            ${isDarkMode ? "text-slate-400" : "text-slate-400"}
          `}
        />
      </div>
    </div>
  );
};

export default LoginInput;
