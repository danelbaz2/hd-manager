import React from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";
import { TaskListItem } from "../parts";

interface DailyListProps {
  tasks: Task[];
  users: UserData[];
  tags: SecondaryTagData[];
}

// Status priority order: pending (1), in_progress (2), completed (3), cancelled (4)
const getStatusPriority = (status?: string): number => {
  switch (status) {
    case "pending":
      return 1;
    case "in_progress":
      return 2;
    case "completed":
      return 3;
    case "cancelled":
      return 4;
    default:
      return 5;
  }
};

const DailyList: React.FC<DailyListProps> = ({ tasks, users, tags }) => {
  const { isDarkMode } = useTheme();

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
        <p className="text-sm mt-2">
          לחץ על "יצירת משימה" כדי להוסיף משימה חדשה
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {/* Header Row - Matches TaskListItem columns */}
      <div
        className={`flex items-center gap-4 px-5 py-3 rounded-xl
          text-xs lg:text-sm font-semibold
          ${
            isDarkMode
              ? "text-slate-400 bg-slate-800/50"
              : "text-slate-500 bg-slate-100"
          }`}
      >
        <div className="w-1.5" /> {/* Color spacer */}
        <div className="w-16 lg:w-20 text-center">ID</div>
        <div className="flex-1">תיאור משימה</div>
        <div className="w-20 lg:w-24 text-center">סטטוס</div>
        <div className="w-28 lg:w-32 text-center">זמן נותר</div>
        <div className="w-40 lg:w-48">משויך ל...</div>
      </div>

      {/* Task Items - Sorted by status priority */}
      {sortedTasks.map((task) => (
        <TaskListItem key={task.id} task={task} users={users} tags={tags} />
      ))}
    </div>
  );
};

export default DailyList;
