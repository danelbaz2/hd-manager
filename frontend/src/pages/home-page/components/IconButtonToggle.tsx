import React from "react";
import { type LucideIcon } from "lucide-react";

interface IconButtonToggleProps<T extends string> {
  options: { id: T; icon: LucideIcon; title: string }[];
  selected: T;
  isDarkMode: boolean;
  onChange: (value: T) => void;
}

/**
 * IconButtonToggle - Icon-only toggle button group (no labels)
 */
function IconButtonToggle<T extends string>({
  options,
  selected,
  isDarkMode,
  onChange,
}: IconButtonToggleProps<T>) {
  return (
    <div
      className={`
        flex items-center p-1 rounded-xl border
        ${isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200 shadow-sm"
        }
      `}
    >
      {options.map((option) => (
        <button
          key={option.id}
          data-tour={`toggle-${option.id}`}
          onClick={() => onChange(option.id)}
          title={option.title}
          className={`
            p-1.5 lg:p-2 rounded-lg transition-all duration-200
            ${selected === option.id
              ? isDarkMode
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-blue-500 text-white shadow-md"
              : isDarkMode
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }
          `}
        >
          <option.icon className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      ))}
    </div>
  );
}

export default IconButtonToggle;
