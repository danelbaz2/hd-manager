import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

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

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px spacing
        left: rect.left, // Align left (or right for RTL, handled by flex/calendar)
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Handle scroll/resize to close dropdown to avoid detachment
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true); // Capture phase to detect scroll in modals
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
      // Check if click is inside button (ref) 
      // Note: Calendar portal content check is tricky, but Calendar component might handle valid clicks?
      // Actually, standard check: if not in ref (button wrapper) AND not in portal content...
      // Since portal is elsewhere, we need a ref for the portal content too?
      // Wait, Calendar handles its own "onClose" usually? No, we pass onClose={() => setIsOpen(false)}.
      // For clicking outside, we need to check if the click target is NOT in the button AND NOT in the dropdown.

      // Simpler: Use a ref for the dropdown content div.
      const dropdownEl = document.getElementById(`datepicker-dropdown-${label}`);

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
  }, [isOpen, label]);


  return (
    <div ref={ref} className="relative">
      <label
        className={`
          block text-sm lg:text-base font-medium mb-1
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        {label}
      </label>

      {/* Input Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2
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

      {/* Portal Calendar Dropdown */}
      {isOpen && createPortal(
        <div
          id={`datepicker-dropdown-${label}`}
          className="fixed z-[99999]"
          style={{
            top: position.top,
            // For RTL: align right edge of dropdown to right edge of button
            // But getBoundingClientRect returns standard coords.
            // If we center it? Or Align Right?
            // Calendar width is standard. Let's align it to match button right side for RTL.
            // right: window.innerWidth - (position.left + position.width),
            // left: 'auto'
            // Let's force it to center under the button or align correctly.
            // Since it's RTL app, alignment should be Right (Start).
            // position.left is the left edge.
            // If I calculate right:
            left: position.left + position.width - 320, // Approx calendar width 320px? 
            // Better: use right style.
            // right: document.documentElement.clientWidth - (position.left + position.width)
          }}
        >
          {/* Wrapper to control width/alignment more precisely */}
          <div style={{ position: 'relative', width: '320px', marginLeft: 'auto' }}>
            <Calendar
              selectedDate={getTimestamp()}
              onDateSelect={handleDateSelect}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePicker;
