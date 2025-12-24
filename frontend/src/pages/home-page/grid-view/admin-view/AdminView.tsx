import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import AdminUserGrid from "./AdminUserGrid";
import Statistics from "../Statistics";

interface AdminViewProps {
  users: UserData[];
  tasks: Task[];
  viewMode: "daily" | "weekly" | "monthly";
  onUserClick?: (user: UserData) => void;
  isUserClickable?: (userId: string) => boolean;
}

// Calculate total stats from all tasks
const calculateTotalStats = (tasks: Task[]) => ({
  open: tasks.filter((t) => t.status === "pending").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  closed: tasks.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  ).length,
});

const getStatTitle = (viewMode: string) => {
  switch (viewMode) {
    case "weekly":
      return "סטטיסטיקה שבועית";
    case "monthly":
      return "סטטיסטיקה חודשית";
    default:
      return "סטטיסטיקה יומית";
  }
};

const AdminView: React.FC<AdminViewProps> = ({
  users,
  tasks,
  viewMode,
  onUserClick,
  isUserClickable,
}) => {
  const stats = calculateTotalStats(tasks);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* User Cards Grid - flex-1 with min-h-0 for proper flex overflow */}
      <div className="flex-1 min-h-0">
        <AdminUserGrid
          users={users}
          tasks={tasks}
          onUserClick={onUserClick}
          isUserClickable={isUserClickable}
        />
      </div>

      {/* Statistics */}
      <Statistics
        open={stats.open}
        inProgress={stats.inProgress}
        closed={stats.closed}
        title={getStatTitle(viewMode)}
      />
    </div>
  );
};

export default AdminView;
