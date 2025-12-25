import React from "react";
import { useTheme } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import AdminUserCard from "./AdminUserCard";

interface AdminUserGridProps {
  users: UserData[];
  tasks: Task[];
  onUserClick?: (user: UserData) => void;
  isUserClickable?: (userId: string) => boolean;
}

const getTaskCountsForUser = (userId: string, tasks: Task[]) => {
  const userTasks = tasks.filter((task) =>
    task.responsibleUserIds?.includes(userId)
  );
  return {
    open: userTasks.filter((task) => task.status === "pending").length,
    inProgress: userTasks.filter((task) => task.status === "in_progress")
      .length,
    closed: userTasks.filter(
      (task) => task.status === "completed" || task.status === "cancelled"
    ).length,
  };
};

const AdminUserGrid: React.FC<AdminUserGridProps> = ({
  users,
  tasks,
  onUserClick,
  isUserClickable,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="h-full" dir="rtl">
      {users.length === 0 ? (
        <div
          className={`h-full flex items-center justify-center rounded-2xl border ${
            isDarkMode ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            אין משתמשים להצגה
          </p>
        </div>
      ) : (
        <div
          dir="ltr"
          className={`h-full p-1 overflow-y-auto ${
            isDarkMode ? "dark-scrollbar" : "light-scrollbar"
          }`}
        >
          <div dir="rtl" className="grid grid-cols-3 gap-2 content-start">
            {users.map((user) => (
              <AdminUserCard
                key={user.id}
                user={user}
                taskCounts={getTaskCountsForUser(user.id, tasks)}
                onUserClick={onUserClick}
                isClickable={isUserClickable ? isUserClickable(user.id) : true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserGrid;
