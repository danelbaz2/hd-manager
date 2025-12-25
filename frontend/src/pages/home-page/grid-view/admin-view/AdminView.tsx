import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import AdminUserGrid from "./AdminUserGrid";
import Statistics from "../Statistics";
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
    (t) => t.status === "completed" || t.status === "cancelled"
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
    <div className="flex flex-col h-full">
      {/* Header Section - MotivationalBanner headline */}
      <div className="">
        <MotivationalBanner userName={user?.fullName} userId={user?.id} />
      </div>

      {/* User Cards Grid - takes remaining space */}
      <div className="flex-1 min-h-5">
        <AdminUserGrid
          users={users}
          tasks={tasks}
          onUserClick={onUserClick}
          isUserClickable={isUserClickable}
        />
      </div>

      {/* Statistics */}
      <div className="shrink-0 mt-4">
        <Statistics
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
