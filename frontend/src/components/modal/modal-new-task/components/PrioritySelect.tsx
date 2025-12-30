import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
  PRIORITY_OPTIONS,
  type TaskPriority,
} from "../../../../schemas/taskTypes";

interface PrioritySelectProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0, width: 0 });

  const currentPriority = PRIORITY_OPTIONS.find((p) => p.id === value);

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right, // Align right edge for RTL
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Handle scroll/resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownEl = document.getElementById(`priority-dropdown`);
      if (
        ref.current &&
        !ref.current.contains(target) &&
        dropdownEl &&
        !dropdownEl.contains(target)
      ) {
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
          block text-sm lg:text-base font-medium mb-1.5
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        דחיפות
      </label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2.5
          rounded-xl border-2
          text-sm lg:text-base font-medium
          transition-all duration-200
          ${isDarkMode
            ? "bg-slate-700/50 border-slate-600 text-white hover:border-slate-500"
            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
          }
          ${isOpen
            ? isDarkMode
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-blue-500 ring-2 ring-blue-500/20"
            : ""
          }
        `}
      >
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        />
        <span>{currentPriority?.label}</span>
      </button>

      {isOpen && createPortal(
        <div
          id="priority-dropdown"
          className={`
            fixed z-[99999]
            py-2 rounded-xl border-2 shadow-xl
            ${isDarkMode
              ? "bg-slate-800 border-slate-600"
              : "bg-white border-slate-200"
            }
          `}
          style={{
            top: position.top,
            right: position.right,
            width: position.width,
          }}
          dir="rtl"
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
                ${value === option.id
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default PrioritySelect;
