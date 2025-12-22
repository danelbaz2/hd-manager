import React from "react";
import { useTheme, useViewState } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { getMonthStart, getMonthEnd } from "../shared";
import DayCell from "./DayCell";

interface MonthlyCalendarProps {
  tasks: Task[];
  users: UserData[];
  selectedDate: number;
  onTaskClick?: (task: Task) => void;
}

const HEBREW_DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

// Get tasks for a specific day
const getTasksForDay = (tasks: Task[], date: Date): Task[] => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return tasks.filter((task) => {
    if (!task.date) return false;
    const taskDate = new Date(task.date);
    return taskDate >= dayStart && taskDate <= dayEnd;
  });
};

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  tasks,
  users,
  selectedDate,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const { setSelectedDate, setViewMode } = useViewState();

  const date = new Date(selectedDate);
  const monthStart = getMonthStart(date);
  const monthEnd = getMonthEnd(date);

  // Handle day cell click - navigate to daily view
  const handleDayClick = (cellDate: Date) => {
    setSelectedDate(cellDate.getTime());
    setViewMode("daily");
  };

  // Generate calendar grid
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  // Create array of day cells
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(date.getFullYear(), date.getMonth(), d));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div dir="rtl">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {HEBREW_DAYS.map((day) => (
          <div
            key={day}
            className={`text-center py-2 text-sm font-bold rounded-lg
              ${
                isDarkMode
                  ? "text-slate-300 bg-slate-800/50"
                  : "text-slate-600 bg-slate-100"
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((cellDate, i) => {
          if (!cellDate) {
            return <div key={`empty-${i}`} className="h-28" />;
          }

          const dayTasks = getTasksForDay(tasks, cellDate);
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <DayCell
              key={cellDate.toISOString()}
              date={cellDate}
              tasks={dayTasks}
              users={users}
              isToday={isToday}
              onDayClick={handleDayClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
