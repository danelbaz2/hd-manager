import React from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";

interface WeeklyListProps {
  tasks: Task[];
  users: UserData[];
  weekStart: Date;
  onTaskClick?: (task: Task) => void;
}

const HEBREW_DAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const getDaysOfWeek = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

const isDateToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

// Helper: Darken a hex color by percentage
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Helper: Check if a date falls within a range (inclusive)
const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

// Helper: Check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

interface TaskWithSpan {
  task: Task;
  startDayIndex: number;
  spanDays: number;
  row: number;
}

// Calculate task spans and rows to avoid overlaps
const calculateTaskSpans = (tasks: Task[], days: Date[]): TaskWithSpan[] => {
  const taskSpans: TaskWithSpan[] = [];
  const rowOccupancy: Map<number, { start: number; end: number }[]> = new Map();

  // Sort tasks by start date, then by duration (longer first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const aStart = a.date || 0;
    const bStart = b.date || 0;
    if (aStart !== bStart) return aStart - bStart;
    const aDuration = (a.deadline || a.date || 0) - (a.date || 0);
    const bDuration = (b.deadline || b.date || 0) - (b.date || 0);
    return bDuration - aDuration;
  });

  for (const task of sortedTasks) {
    if (!task.date) continue;

    const taskStartDate = new Date(task.date);
    const taskEndDate = task.deadline ? new Date(task.deadline) : taskStartDate;

    // Find the first day index where this task appears in the week
    let startDayIndex = -1;
    let endDayIndex = -1;

    for (let i = 0; i < days.length; i++) {
      if (isDateInRange(days[i], taskStartDate, taskEndDate)) {
        if (startDayIndex === -1) startDayIndex = i;
        endDayIndex = i;
      }
    }

    // If task doesn't appear in this week, skip
    if (startDayIndex === -1) continue;

    const spanDays = endDayIndex - startDayIndex + 1;

    // Find a row that doesn't conflict
    let row = 0;
    let foundRow = false;
    while (!foundRow) {
      const occupancy = rowOccupancy.get(row) || [];
      const hasConflict = occupancy.some(
        (o) => !(endDayIndex < o.start || startDayIndex > o.end)
      );
      if (!hasConflict) {
        foundRow = true;
        occupancy.push({ start: startDayIndex, end: endDayIndex });
        rowOccupancy.set(row, occupancy);
      } else {
        row++;
      }
    }

    taskSpans.push({
      task,
      startDayIndex,
      spanDays,
      row,
    });
  }

  return taskSpans;
};

const WeeklyList: React.FC<WeeklyListProps> = ({
  tasks,
  users,
  weekStart,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const days = getDaysOfWeek(weekStart);
  const taskSpans = calculateTaskSpans(tasks, days);

  // Get maximum row count
  const maxRow = taskSpans.reduce((max, ts) => Math.max(max, ts.row), -1) + 1;

  return (
    <div
      className={`rounded-2xl border h-full overflow-hidden flex flex-col ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Header Row - Day Names and Dates */}
      <div
        className={`grid grid-cols-7 border-b shrink-0 ${
          isDarkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        {days.map((day, index) => {
          const isToday = isDateToday(day);
          const dayOfWeek = day.getDay();

          return (
            <div
              key={day.toISOString()}
              className={`py-4 px-2 text-center ${
                index < 6
                  ? isDarkMode
                    ? "border-l border-slate-700"
                    : "border-l border-slate-200"
                  : ""
              }`}
            >
              {/* Day Name */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? "text-blue-500 font-semibold"
                    : isDarkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {HEBREW_DAY_NAMES[dayOfWeek]}
              </div>
              {/* Date */}
              <div
                className={`text-lg font-bold ${
                  isToday
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                {formatDate(day)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Rows Area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Grid background with column borders */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={`${
                index < 6
                  ? isDarkMode
                    ? "border-l border-slate-700"
                    : "border-l border-slate-200"
                  : ""
              }`}
            />
          ))}
        </div>

        {/* Tasks container */}
        <div className="relative p-2" style={{ minHeight: maxRow * 60 + 20 }}>
          {taskSpans.map(({ task, startDayIndex, spanDays, row }) => {
            const user = users.find((u) =>
              task.responsibleUserIds?.includes(u.id)
            );
            const userColor = user?.color || "#6366F1";
            const textColor = isDarkMode
              ? userColor
              : darkenColor(userColor, 30);

            // Calculate position and width
            // Each column is 100%/7 wide
            const columnWidth = 100 / 7;
            // RTL: right position is (6 - startDayIndex) * columnWidth
            // But since we're in RTL, we use 'right' positioning
            const rightPosition = startDayIndex * columnWidth;
            const width = spanDays * columnWidth;

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={`
                  absolute rounded-lg py-2 px-3 cursor-pointer
                  transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:z-10
                  ${
                    isDarkMode
                      ? "bg-slate-800 hover:bg-slate-700 border border-slate-700"
                      : "bg-white hover:bg-slate-50 shadow-sm border border-slate-100"
                  }
                `}
                style={{
                  right: `calc(${rightPosition}% + 4px)`,
                  width: `calc(${width}% - 8px)`,
                  top: row * 60 + 8,
                  height: 52,
                  borderRight: `4px solid ${userColor}`,
                }}
              >
                {/* Task Title */}
                <div
                  className={`text-sm font-semibold truncate ${
                    isDarkMode ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </div>
                {/* User Name */}
                {user && (
                  <div
                    className="text-xs font-medium truncate flex items-center gap-1 mt-0.5"
                    style={{ color: textColor }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: userColor }}
                    />
                    {user.fullName}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {taskSpans.length === 0 && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <p className="text-sm">אין משימות השבוע</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyList;
