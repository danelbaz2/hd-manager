import React from "react";
import { useTheme, useAuth } from "../../../../contexts";
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
      (task) => task.status === "completed"
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
  const { user: authUser } = useAuth();

  return (
    <div className="h-full" dir="rtl">
      {users.length === 0 ? (
        <div
          className={`h-full flex items-center justify-center rounded-2xl border ${isDarkMode ? "border-slate-700" : "border-slate-200"
            }`}
        >
          <p
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
          >
            אין משתמשים להצגה
          </p>
        </div>
      ) : (
        <div
          dir="ltr"
          className={`h-full overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
            }`}
        >
          <div
            dir="rtl"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start w-full px-1 pt-1 pb-1"
          >
            {users.map((user) => (
              <div
                key={user.id}
                className="h-full"
                data-tour={
                  user.id === authUser?.id ? "my-user-card" : undefined
                }
              >
                <AdminUserCard
                  user={user}
                  taskCounts={getTaskCountsForUser(user.id, tasks)}
                  onUserClick={onUserClick}
                  isClickable={
                    isUserClickable ? isUserClickable(user.id) : true
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserGrid;
