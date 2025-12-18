import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import Calendar from "../../Layout/header-bar/Calendar";

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "בחר תאריך",
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Convert string date to timestamp for Calendar
  const getTimestamp = (): number => {
    if (value) {
      return new Date(value).getTime();
    }
    return new Date().getTime();
  };

  // Handle date selection from Calendar
  const handleDateSelect = (timestamp: number) => {
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().split("T")[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Close when clicking outside
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
        {label}
      </label>

      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          px-4 py-3
          rounded-xl border-2
          text-sm lg:text-base
          transition-all duration-200
          ${isDarkMode
            ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
            : "bg-white border-slate-200 hover:border-slate-300"
          }
          ${isOpen
            ? isDarkMode
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-blue-500 ring-2 ring-blue-500/20"
            : ""
          }
        `}
      >
        <CalendarIcon
          className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
        />
        <span
          className={
            value
              ? isDarkMode
                ? "text-white"
                : "text-slate-800"
              : isDarkMode
                ? "text-slate-400"
                : "text-slate-400"
          }
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-40">
          <Calendar
            selectedDate={getTimestamp()}
            onDateSelect={handleDateSelect}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
