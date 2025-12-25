import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task } from "../../../../api/tasksApi";
import UserCardLine from "./UserCardLine";
import TaskBrief from "./TaskBrief";
import MotivationalBanner from "../MotivationalBanner";
import Statistics from "../Statistics";

interface UserViewProps {
  user: UserData;
  tasks: Task[]; // User's personal tasks
  allTasks: Task[]; // All team tasks for statistics
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

const UserView: React.FC<UserViewProps> = ({
  user,
  tasks,
  allTasks,
  viewMode,
  onUserClick,
}) => {
  const personalStats = getTaskCountsForUser(tasks);
  const teamStats = calculateTotalStats(allTasks);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - 20% height: Banner + UserCard in a row */}
      <div className="min-h-[100px] flex items-center shrink-0" dir="rtl">
        <div className="flex items-center w-full gap-4">
          {/* Motivational Banner */}
          <div className="shrink-0">
            <MotivationalBanner userName={user.fullName} userId={user.id} />
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* User Card - Line Style */}
          <div className="flex-1">
            <UserCardLine
              user={user}
              taskCounts={personalStats}
              onUserClick={() => onUserClick?.()}
            />
          </div>
        </div>
      </div>

      {/* Task Brief - Takes remaining space */}
      <div className="flex-1 overflow-auto">
        <TaskBrief tasks={tasks} />
      </div>

      {/* Team Statistics */}
      <div className="shrink-0 mt-4">
        <Statistics
          open={teamStats.open}
          inProgress={teamStats.inProgress}
          closed={teamStats.closed}
          title={getStatTitle(viewMode)}
        />
      </div>
    </div>
  );
};

export default UserView;
