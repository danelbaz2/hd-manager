import React, { useRef } from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
} from "../../../schemas/tagTypes";
import { TaskListItem } from "../parts";
import { ScrollToLatestButton } from "../../../components/common/ScrollToLatestButton";

interface DailyListProps {
  tasks: Task[];
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  onTaskClick?: (task: Task) => void;
}

// Status priority order: pending (1), in_progress (2), completed (3)
const getStatusPriority = (status?: string): number => {
  switch (status) {
    case "pending":
      return 1;
    case "in_progress":
      return 2;
    case "completed":
      return 3;
    default:
      return 4;
  }
};

const DailyList: React.FC<DailyListProps> = ({
  tasks,
  users,
  primaryTags,
  secondaryTags,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort tasks by status priority
  const sortedTasks = [...tasks].sort(
    (a, b) => getStatusPriority(a.status) - getStatusPriority(b.status)
  );

  if (tasks.length === 0) {
    return (
      <div
        className={`text-center py-16
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        <p className="text-lg">אין משימות להצגה</p>
        <p className="text-sm mt-2"></p>
      </div>
    );
  }

  // Header uses SAME classes as TaskListItem: gap-2 lg:gap-4, p-3 lg:p-5
  // Column widths match TaskListItem exactly
  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header Row - Matches TaskListItem layout exactly */}
      <div
        className={`flex items-center gap-2 lg:gap-4 lg:px-10 py-3 lg:py-5 rounded-t-xl border border-b-0
          text-xs lg:text-sm font-semibold
          ${
            isDarkMode
              ? "text-slate-400 bg-slate-800/80 border-slate-700"
              : "text-slate-500 bg-slate-50 border-slate-200"
          }`}
      >
        {/* Color spacer - w-1 lg:w-1.5 */}
        <div className="w-1 lg:w-1.5 shrink-0" />
        {/* ID - hidden md:block w-14 lg:w-20 */}
        <div className="hidden md:block w-14 lg:w-20 shrink-0 text-center">
          ID
        </div>
        {/* Title - flex-1 min-w-0 */}
        <div className="flex-1 min-w-0">תיאור משימה</div>
        {/* Tags - hidden lg:flex w-24 lg:w-32 */}
        <div className="hidden lg:flex w-24 lg:w-32 shrink-0 justify-center">
          תגיות
        </div>
        {/* Status - w-28 lg:w-32 */}
        <div className="w-28 lg:w-32 shrink-0 text-center">סטטוס</div>
        {/* Days remaining - hidden md:flex w-20 lg:w-32 */}
        <div className="hidden md:flex w-20 lg:w-32 shrink-0 justify-center">
          זמן נותר
        </div>
        {/* Assigned - hidden sm:flex w-24 lg:w-40 */}
        <div className="hidden sm:flex w-24 lg:w-40 shrink-0">משויך ל...</div>
      </div>

      {/* Scrollable Task List Container */}
      <div className="flex-1 min-h-0 relative">
        <div
          ref={scrollRef}
          className={`absolute inset-0 overflow-y-auto rounded-b-xl border border-t-0 space-y-2 lg:space-y-3 px-3 py-3
            ${
              isDarkMode
                ? "border-slate-700 dark-scrollbar"
                : "border-slate-200 light-scrollbar"
            }`}
        >
          {/* Task Items - Sorted by status priority */}
          {sortedTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              users={users}
              primaryTags={primaryTags}
              secondaryTags={secondaryTags}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
        <ScrollToLatestButton
          containerRef={scrollRef}
          direction="up"
          className="top-3"
        />
      </div>
    </div>
  );
};

export default DailyList;
