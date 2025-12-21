import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme, useViewState, useAuth } from "../../../contexts";
import defaultProfile from "../../../assets/default-profile.jpg";
import Calendar from "./Calendar";
import MenuItemProfile from "./MenuItemProfile";

const HEBREW_DAYS_FULL = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

// Format date for daily view: "חמישי, 18.12"
const formatDateHebrew = (date: Date): string => {
  const dayName = HEBREW_DAYS_FULL[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day}.${month}`;
};

// Format date range for weekly view: "14.12 - 20.12"
const formatWeekRange = (date: Date): string => {
  // Find Sunday of the week
  const start = new Date(date);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  // Find Saturday of the week
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatDay = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}`;
  return `${formatDay(end)} - ${formatDay(start)}`;
};

interface HeaderBarProps {
  className?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ className }) => {
  const { isDarkMode } = useTheme();
  const { viewMode, selectedDate, setSelectedDate } = useViewState();
  const { user } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Convert timestamp to Date object for display
  const currentDate = new Date(selectedDate);

  // Change date - for weekly mode, move by 7 days
  const changeDate = (direction: number) => {
    const newDate = new Date(selectedDate);
    const daysToAdd = viewMode === "weekly" ? 7 : 1;
    newDate.setDate(newDate.getDate() + direction * daysToAdd);
    setSelectedDate(newDate.getTime());
  };

  // Handle date selection from calendar
  const handleDateSelect = (timestamp: number) => {
    setSelectedDate(timestamp);
    setIsCalendarOpen(false);
  };
  console.log(user);
  // Get display text based on view mode
  const getDateDisplayText = (): string => {
    if (viewMode === "weekly") {
      return formatWeekRange(currentDate);
    }
    return formatDateHebrew(currentDate);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    if (isUserMenuOpen || isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, isCalendarOpen]);

  return (
    <header
      className={`
        relative
        h-16 md:h-20 lg:h-24
        shrink-0 flex items-center justify-between
        px-4 md:px-6 lg:px-8
        shadow-sm z-30
        ${isDarkMode ? "bg-slate-800" : "bg-white"}
        ${className || ""}
      `}
    >
      {/* Left side - User Profile */}
      <div className="flex items-center gap-2 md:gap-4 relative" ref={menuRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`
            flex items-center gap-2 md:gap-3
            p-1.5 md:p-2 rounded-xl
            transition-colors
            ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}
          `}
        >
          <img
            src={user?.profileImage || defaultProfile}
            alt="Profile"
            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
          />
          <span
            className={`
              hidden sm:block font-bold
              text-sm md:text-base lg:text-lg
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            {user?.fullName || "אורח"}
          </span>
        </button>

        {/* User Dropdown Menu */}
        <MenuItemProfile
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>

      {/* Center - Date Picker */}
      <div
        ref={calendarRef}
        className="absolute left-1/2 transform -translate-x-1/2"
      >
        <div
          className={`
            flex items-center
            rounded-full shadow-sm border
            px-1 md:px-2 py-1
            ${
              isDarkMode
                ? "bg-slate-700 border-slate-600"
                : "bg-white border-slate-200"
            }
          `}
        >
          <button
            onClick={() => changeDate(1)}
            className={`
              p-1.5 md:p-2
              rounded-full transition-colors
              ${
                isDarkMode
                  ? "hover:bg-slate-600 text-slate-300"
                  : "hover:bg-slate-100 text-slate-500"
              }
            `}
            aria-label={viewMode === "weekly" ? "Next week" : "Next day"}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="px-3 md:px-4 min-w-[100px] md:min-w-[140px] text-center cursor-pointer select-none"
          >
            <span
              className={`
                font-bold text-sm md:text-sm lg:text-base
                ${isDarkMode ? "text-slate-200" : "text-slate-700"}
              `}
            >
              {getDateDisplayText()}
            </span>
          </div>
          <button
            onClick={() => changeDate(-1)}
            className={`
              p-1.5 md:p-1
              rounded-full transition-colors
              ${
                isDarkMode
                  ? "hover:bg-slate-600 text-slate-300"
                  : "hover:bg-slate-100 text-slate-500"
              }
            `}
            aria-label={
              viewMode === "weekly" ? "Previous week" : "Previous day"
            }
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Calendar Popup */}
        {isCalendarOpen && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;
