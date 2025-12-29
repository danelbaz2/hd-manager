import React from "react";
import { useTheme } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";
import { type Task } from "../../../api/tasksApi";
import UserCard from "./UserCard";

interface UserCardGridProps {
  users: UserData[];
  tasks: Task[];
  onUserClick?: (user: UserData) => void;
  isUserClickable?: (userId: string) => boolean;
}

// Calculate task counts for a specific user
const getTaskCountsForUser = (
  userId: string,
  tasks: Task[]
): { open: number; inProgress: number; closed: number } => {
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

const UserCardGrid: React.FC<UserCardGridProps> = ({
  users,
  tasks,
  onUserClick,
  isUserClickable,
}) => {
  const { isDarkMode } = useTheme();

  if (users.length === 0) {
    return (
      <div
        className={`
          text-center py-16
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        <p className="text-lg">אין משתמשים להצגה</p>
        <p className="text-sm mt-2">הוסף משתמשים דרך הגדרות המערכת</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4"
      dir="rtl"
    >
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
  );
};

export default UserCardGrid;
