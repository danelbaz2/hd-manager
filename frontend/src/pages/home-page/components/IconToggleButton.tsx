import React from "react";
import { type LucideIcon } from "lucide-react";

interface ToggleButtonProps<T extends string> {
  options: { id: T; label: string; icon: LucideIcon }[];
  selected: T;
  isDarkMode: boolean;
  onChange: (value: T) => void;
}

/**
 * IconToggleButton - Reusable toggle button group with icons and labels
 */
function IconToggleButton<T extends string>({
  options,
  selected,
  isDarkMode,
  onChange,
}: ToggleButtonProps<T>) {
  return (
    <div
      className={`
        flex items-center p-1 rounded-xl border
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200 shadow-sm"
        }
      `}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`
            flex items-center gap-1.5 lg:gap-2
            px-3 lg:px-4 py-1.5 lg:py-2
            rounded-lg
            text-xs lg:text-sm font-medium
            transition-all duration-200
            ${
              selected === option.id
                ? isDarkMode
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-blue-500 text-white shadow-md"
                : isDarkMode
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }
          `}
        >
          <option.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export default IconToggleButton;
