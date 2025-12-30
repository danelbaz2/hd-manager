import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import AdminUserGrid from "./AdminUserGrid";
import TaskStatusSummary from "../TaskStatusSummary";
import MotivationalBanner from "../MotivationalBanner";
import { useAuth } from "../../../../contexts";

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
    (t) => t.status === "completed"
  ).length,
});

const getStatTitle = (viewMode: string) => {
  switch (viewMode) {
    case "weekly":
      return "סטטיסטיקה צוותית שבועית";
    case "monthly":
      return "סטטיסטיקה צוותית חודשית";
    default:
      return "סטטיסטיקה צוותית יומית";
  }
};

const AdminView: React.FC<AdminViewProps> = ({
  users,
  tasks,
  viewMode,
  onUserClick,
  isUserClickable,
}) => {
  const { user } = useAuth();
  const stats = calculateTotalStats(tasks);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Section - MotivationalBanner headline */}
      <div className="shrink-0 py-1">
        <MotivationalBanner userName={user?.fullName} userId={user?.id} />
      </div>

      {/* User Cards Grid - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AdminUserGrid
          users={users}
          tasks={tasks}
          onUserClick={onUserClick}
          isUserClickable={isUserClickable}
        />
      </div>

      {/* Statistics - Compact bar at bottom */}
      <div className="shrink-0 pt-1">
        <TaskStatusSummary
          open={stats.open}
          inProgress={stats.inProgress}
          closed={stats.closed}
          title={getStatTitle(viewMode)}
        />
      </div>
    </div>
  );
};

export default AdminView;
