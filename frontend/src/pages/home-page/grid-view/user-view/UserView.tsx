import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import PersonalUserCard from "./PersonalUserCard";
import TaskBrief from "./TaskBrief";
import { Statistics } from "../admin-view";

interface UserViewProps {
  user: UserData;
  tasks: Task[];
  viewMode: "daily" | "weekly" | "monthly";
  onUserClick?: () => void;
}

const getTaskCountsForUser = (tasks: Task[]) => ({
  open: tasks.filter((t) => t.status === "pending").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  closed: tasks.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  ).length,
});

const getStatTitle = (viewMode: string) => {
  switch (viewMode) {
    case "weekly":
      return "הסטטיסטיקה שלי - שבועי";
    case "monthly":
      return "הסטטיסטיקה שלי - חודשי";
    default:
      return "הסטטיסטיקה שלי - יומי";
  }
};

const UserView: React.FC<UserViewProps> = ({
  user,
  tasks,
  viewMode,
  onUserClick,
}) => {
  const stats = getTaskCountsForUser(tasks);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Personal User Card */}
      <PersonalUserCard user={user} taskCounts={stats} onClick={onUserClick} />

      {/* Task Brief */}
      <div className="flex-1 overflow-auto">
        <TaskBrief tasks={tasks} />
      </div>

      {/* Personal Statistics */}
      <Statistics
        open={stats.open}
        inProgress={stats.inProgress}
        closed={stats.closed}
        title={getStatTitle(viewMode)}
      />
    </div>
  );
};

export default UserView;
