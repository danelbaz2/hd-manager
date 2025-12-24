import React from "react";
import { Users } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import UserCard from "../UserCard";

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
    <div
      className={`rounded-2xl border p-4 ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-500" />
        <h3
          className={`font-bold text-sm ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          צוות ({users.length}X3)
        </h3>
      </div>

      {/* User Cards Grid - 3 columns */}
      {users.length === 0 ? (
        <div
          className={`text-center py-8 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <p className="text-sm">אין משתמשים להצגה</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              taskCounts={getTaskCountsForUser(user.id, tasks)}
              onUserClick={onUserClick}
              isClickable={isUserClickable ? isUserClickable(user.id) : true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserGrid;
