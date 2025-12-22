import React from "react";
import { User, Flag, CalendarRange } from "lucide-react";
import { useTheme, useSettings } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { getLighterColor, getTextColor } from "../../../schemas/tagTypes";
import {
  HEBREW_DAYS_FULL,
  getUserById,
  getWeeklyStatusColor,
  getGridPosition,
  assignVisualRows,
  generateWeekDays,
  filterWeekTasks,
  type ProcessedTask,
} from "./weeklyViewUtils";

interface TaskListWeeklyProps {
  tasks: Task[];
  users: UserData[];
  weekStart: Date;
  onTaskClick?: (task: Task) => void;
}

/**
 * TaskListWeekly - Weekly calendar view for tasks
 * Refactored to use weeklyViewUtils.ts for helper functions
 */
const TaskListWeekly: React.FC<TaskListWeeklyProps> = ({
  tasks,
  users,
  weekStart,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const { primaryTags, secondaryTags } = useSettings();

  // Helper to get secondary tags with primary color
  const getTaskSecondaryTags = (task: Task) => {
    return (task.secondaryTagIds || [])
      .map((tagId) => {
        const secondaryTag = secondaryTags.find((st) => st.id === tagId);
        if (!secondaryTag) return null;
        const primaryTag = primaryTags.find(
          (pt) => pt.id === secondaryTag.primaryTagId
        );
        return {
          ...secondaryTag,
          primaryColor: primaryTag?.color || "#1E40AF",
        };
      })
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null);
  };

  // Setup date window
  const startWindow = new Date(weekStart);
  startWindow.setHours(0, 0, 0, 0);

  const endWindow = new Date(startWindow);
  endWindow.setDate(startWindow.getDate() + 6);
  endWindow.setHours(23, 59, 59, 999);

  const weekDays = generateWeekDays(startWindow);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Process tasks
  const weekTasks = filterWeekTasks(tasks, startWindow, endWindow);
  const processedTasks: ProcessedTask[] = assignVisualRows(
    weekTasks.map((t) => ({
      ...t,
      ...getGridPosition(t, startWindow, endWindow),
      visualRow: 0,
    }))
  );

  return (
    <div
      className={`
        h-full flex flex-col rounded-2xl border overflow-hidden shadow-sm
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }
      `}
      dir="rtl"
    >
      {/* Calendar Header */}
      <div
        className={`
          grid grid-cols-7 border-b divide-x divide-x-reverse sticky top-0 z-20
          ${
            isDarkMode
              ? "border-slate-700 divide-slate-700 bg-slate-800"
              : "border-slate-100 divide-slate-100 bg-white"
          }
        `}
      >
        {weekDays.map((date, i) => {
          const isToday = today.toDateString() === date.toDateString();
          return (
            <div
              key={i}
              className={`p-3 text-center transition-colors ${
                isToday ? (isDarkMode ? "bg-blue-900/20" : "bg-blue-50/50") : ""
              }`}
            >
              <div
                className={`text-xs font-bold mb-1 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {HEBREW_DAYS_FULL[date.getDay()]}
              </div>
              <div
                className={`text-sm font-bold ${
                  isToday
                    ? "text-blue-600 scale-110 transform"
                    : isDarkMode
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {date.getDate()}/{date.getMonth() + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Body */}
      <div
        className={`flex-1 relative overflow-y-auto p-2 ${
          isDarkMode ? "dark-scrollbar" : "light-scrollbar"
        }`}
      >
        {/* Background Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`
                border-l border-r border-dashed border-opacity-30 h-full
                first:border-r-0 last:border-l-0
                ${isDarkMode ? "border-slate-700" : "border-slate-200"}
              `}
            />
          ))}
        </div>

        {/* Tasks Grid */}
        <div
          className="grid grid-cols-7 gap-y-2 relative z-10"
          style={{ gridAutoRows: "minmax(45px, auto)" }}
        >
          {processedTasks.map((task) => {
            const responsible =
              task.responsibleUserIds && task.responsibleUserIds.length > 0
                ? getUserById(task.responsibleUserIds[0], users)
                : null;
            const taskTags = getTaskSecondaryTags(task);

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className={`
                  mx-1 p-2 rounded-lg border shadow-sm cursor-pointer
                  hover:shadow-md hover:translate-y-[-1px] transition-all
                  flex flex-col justify-center relative group overflow-hidden
                  ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-slate-200"
                  }
                `}
                style={{
                  gridColumnStart: task.colStart,
                  gridColumnEnd: `span ${task.colSpan}`,
                  gridRowStart: task.visualRow + 1,
                }}
              >
                {/* Status Bar */}
                <div
                  className={`absolute top-0 bottom-0 right-0 w-1.5 ${getWeeklyStatusColor(
                    task.status
                  )}`}
                />

                <div className="pr-3 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold truncate ${
                      isDarkMode ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {task.title || "ללא כותרת"}
                  </span>
                </div>

                <div className="pr-3 flex items-center gap-2 mt-1">
                  {taskTags.slice(0, 2).map((tag) => {
                    const lightColor = getLighterColor(tag.primaryColor);
                    return (
                      <span
                        key={tag.id}
                        className="px-1.5 py-0.5 rounded text-[8px] font-semibold truncate max-w-[60px]"
                        style={{
                          backgroundColor: lightColor,
                          color: getTextColor(lightColor),
                        }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                  {taskTags.length > 2 && (
                    <span
                      className={`text-[8px] ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      +{taskTags.length - 2}
                    </span>
                  )}
                  {responsible && (
                    <div
                      className={`flex items-center gap-1 text-[10px] mr-auto ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <User size={10} />
                      <span className="truncate max-w-[60px]">
                        {responsible.fullName}
                      </span>
                    </div>
                  )}
                  {task.priority === "high" && (
                    <Flag
                      size={10}
                      className="text-red-500 flex-shrink-0"
                      fill="currentColor"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {processedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60">
            <CalendarRange size={48} className="mb-2" />
            <p>אין משימות לשבוע זה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListWeekly;
