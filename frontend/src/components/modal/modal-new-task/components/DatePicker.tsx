import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import Calendar from "../../../../components/layout/header-bar/Calendar";

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
}

// Helper: Format date to YYYY-MM-DD using local time
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Parse YYYY-MM-DD string to local date timestamp
const parseDateStringToTimestamp = (dateStr: string): number => {
  if (!dateStr) return Date.now();
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime(); // Use noon to avoid timezone issues
};

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
    return parseDateStringToTimestamp(value);
  };

  // Handle date selection from Calendar
  const handleDateSelect = (timestamp: number) => {
    const date = new Date(timestamp);
    const formattedDate = formatDateLocal(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Format date for display (DD/MM/YYYY)
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
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
          ${
            isDarkMode
              ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
              : "bg-white border-slate-200 hover:border-slate-300"
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
        <CalendarIcon
          className={`w-5 h-5 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
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
