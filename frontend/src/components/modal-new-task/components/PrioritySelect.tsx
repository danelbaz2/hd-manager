import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  PRIORITY_OPTIONS,
  type TaskPriority,
} from "../../../schemas/taskTypes";

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentPriority = PRIORITY_OPTIONS.find((p) => p.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <label
        className={`
          block text-sm lg:text-base font-medium mb-2
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        דחיפות
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          px-4 py-3
          rounded-xl border-2
          text-sm lg:text-base font-medium
          transition-all duration-200
          ${
            isDarkMode
              ? "bg-slate-700/50 border-slate-600 text-white hover:border-slate-500"
              : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
          }
          ${
            isOpen
              ? isDarkMode
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-blue-500 ring-2 ring-blue-500/20"
              : ""
          }
        `}
      >
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        />
        <span>{currentPriority?.label}</span>
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 right-0 left-0 z-30
            py-2 rounded-xl border-2 shadow-xl
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-200"
            }
          `}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`
                w-full text-right px-4 py-2.5
                text-sm lg:text-base font-medium
                transition-colors
                ${
                  value === option.id
                    ? isDarkMode
                      ? "bg-blue-900/40 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                    : isDarkMode
                    ? "text-slate-300 hover:bg-slate-700"
                    : "text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrioritySelect;
