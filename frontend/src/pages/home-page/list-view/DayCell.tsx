import React from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";

interface DayCellProps {
  date: Date;
  tasks: Task[];
  users: UserData[];
  isToday: boolean;
  onDayClick: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  tasks,
  users,
  isToday,
  onDayClick,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      onClick={() => onDayClick(date)}
      className={`h-28 p-2 rounded-lg border overflow-hidden cursor-pointer
        transition-all duration-200 hover:shadow-md flex flex-col
        ${
          isToday
            ? isDarkMode
              ? "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
              : "border-blue-400 bg-blue-50 hover:bg-blue-100"
            : isDarkMode
            ? "border-slate-700 bg-slate-800/30 hover:bg-slate-700/50"
            : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
    >
      {/* Date Number */}
      <div
        className={`text-sm font-bold mb-1 shrink-0
          ${
            isToday
              ? "text-blue-500"
              : isDarkMode
              ? "text-slate-300"
              : "text-slate-700"
          }`}
      >
        {date.getDate()}
      </div>

      {/* Scrollable Tasks Container - Hidden scrollbar */}
      <div
        className="flex-1 overflow-y-auto space-y-1 scrollbar-hide"
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE/Edge */,
        }}
      >
        {tasks.map((task) => {
          const user = users.find((u) =>
            task.responsibleUserIds?.includes(u.id)
          );
          const userColor = user?.color || "#6366F1";
          // Darker text for light mode visibility
          const textColor = isDarkMode ? userColor : darkenColor(userColor, 30);

          return (
            <div
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(task);
              }}
              className="text-xs font-semibold truncate px-2 py-1 rounded-md cursor-pointer
                transition-all duration-150 hover:scale-[1.02] hover:shadow-sm"
              style={{
                background: isDarkMode
                  ? `linear-gradient(135deg, ${userColor}20 0%, ${userColor}40 100%)`
                  : `linear-gradient(135deg, ${userColor}15 0%, ${userColor}30 100%)`,
                color: textColor,
                borderRight: `3px solid ${userColor}`,
              }}
            >
              {task.title}
            </div>
          );
        })}
      </div>

      {/* Task Count Badge */}
      {tasks.length > 0 && (
        <div
          className={`text-[10px] font-medium text-center mt-1 shrink-0
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          {tasks.length} משימות
        </div>
      )}
    </div>
  );
};

// Helper: Darken a hex color by percentage
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export default DayCell;
