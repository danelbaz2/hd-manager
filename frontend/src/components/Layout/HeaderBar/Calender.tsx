import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface CalenderProps {
  selectedDate: number;
  onDateSelect: (timestamp: number) => void;
  onClose?: () => void;
}

const HEBREW_DAYS_SHORT = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const Calender: React.FC<CalenderProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  // Get the first day of the month
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get the number of days in the month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get the previous month's days to fill the calendar
  const getDaysInPrevMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  };

  // Change month
  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + increment);
    setViewDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const daysInPrevMonth = getDaysInPrevMonth(viewDate);
    const days: (number | null)[] = [];

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(-(daysInPrevMonth - i));
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add next month's days to complete the grid
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(-(100 + i));
      }
    }

    return days;
  };

  const handleDayClick = (day: number) => {
    if (day < 0) return; // Ignore prev/next month days

    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateSelect(newDate.getTime());
    onClose?.();
  };

  const isToday = (day: number): boolean => {
    if (day < 0) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (day < 0) return false;
    const selected = new Date(selectedDate);
    return (
      day === selected.getDate() &&
      viewDate.getMonth() === selected.getMonth() &&
      viewDate.getFullYear() === selected.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();

  return (
    <div
      className={`
        w-[256px] md:w-[288px]
        rounded-2xl shadow-2xl border
        p-3 md:p-4
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }
      `}
    >
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(1)}
          className={`
            p-1.5 rounded-lg transition-colors
            ${
              isDarkMode
                ? "hover:bg-slate-700 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
            }
          `}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>

        <h3
          className={`
            text-sm md:text-base font-bold
            ${isDarkMode ? "text-white" : "text-slate-800"}
          `}
        >
          {HEBREW_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>

        <button
          onClick={() => changeMonth(-1)}
          className={`
            p-1.5 rounded-lg transition-colors
            ${
              isDarkMode
                ? "hover:bg-slate-700 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
            }
          `}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {HEBREW_DAYS_SHORT.map((day, index) => (
          <div
            key={index}
            className={`
              text-center text-xs font-semibold py-1
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) return null;

          const isPrevNextMonth = day < 0;
          const displayDay = isPrevNextMonth ? Math.abs(day) % 100 : day;
          const todayCheck = isToday(day);
          const selectedCheck = isSelected(day);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={isPrevNextMonth}
              className={`
                aspect-square
                flex items-center justify-center
                text-xs md:text-sm font-medium
                rounded-lg
                transition-all duration-200
                ${
                  isPrevNextMonth
                    ? isDarkMode
                      ? "text-slate-600 cursor-default"
                      : "text-slate-300 cursor-default"
                    : ""
                }
                ${
                  !isPrevNextMonth && !selectedCheck && !todayCheck
                    ? isDarkMode
                      ? "text-slate-200 hover:bg-slate-700"
                      : "text-slate-700 hover:bg-slate-100"
                    : ""
                }
                ${
                  todayCheck && !selectedCheck
                    ? isDarkMode
                      ? "text-blue-400 hover:bg-slate-700"
                      : "text-blue-600 hover:bg-blue-50"
                    : ""
                }
                ${
                  selectedCheck
                    ? isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                    : ""
                }
              `}
            >
              {displayDay}
            </button>
          );
        })}
      </div>

      {/* Footer with today button */}
      <div className="mt-3 pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}">
        <button
          onClick={() => {
            const today = new Date();
            setViewDate(today);
            onDateSelect(today.getTime());
            onClose?.();
          }}
          className={`
            w-full py-1.5 px-3 rounded-lg
            text-xs font-medium
            transition-colors
            ${
              isDarkMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }
          `}
        >
          היום
        </button>
      </div>
    </div>
  );
};

export default Calender;
