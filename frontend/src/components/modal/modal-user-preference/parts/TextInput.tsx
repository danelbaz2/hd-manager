import React from "react";
import { useTheme } from "../../../../contexts";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium text-right ${isDarkMode ? "text-slate-300" : "text-slate-700"
          }`}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        dir="rtl"
        className={`
          w-full px-4 py-3 rounded-xl border text-right
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isDarkMode
            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
          }
        `}
      />
    </div>
  );
};

export default TextInput;

