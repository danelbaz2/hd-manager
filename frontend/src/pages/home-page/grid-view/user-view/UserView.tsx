import React from "react";
import { type UserData } from "../../../../schemas/userTypes";
import { type Task, type TaskStatus } from "../../../../api/tasksApi";
import UserCardLine from "./UserCardLine";
import TaskBrief from "./TaskBrief";
import MotivationalBanner from "../MotivationalBanner";
import TaskStatusSummary from "../TaskStatusSummary";

interface UserViewProps {
  user: UserData;
  tasks: Task[]; // User's personal tasks
  allTasks: Task[]; // All team tasks for statistics
  viewMode: "daily" | "weekly" | "monthly";
  onUserClick?: () => void;
  onStatusSummaryClick?: (status: TaskStatus) => void;
}

const getTaskCountsForUser = (tasks: Task[]) => ({
  open: tasks.filter((t) => t.status === "pending").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  pendingApproval: tasks.filter((t) => t.status === "pending_approval").length,
  closed: tasks.filter((t) => t.status === "completed").length,
});

// Calculate total stats from all tasks
const calculateTotalStats = (tasks: Task[]) => ({
  open: tasks.filter((t) => t.status === "pending").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  pendingApproval: tasks.filter((t) => t.status === "pending_approval").length,
  closed: tasks.filter((t) => t.status === "completed").length,
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
  onStatusSummaryClick,
}) => {
  const personalStats = getTaskCountsForUser(tasks);
  const teamStats = calculateTotalStats(allTasks);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Section - Banner + UserCard in a row */}
      <div className="shrink-0 flex items-center py-2 lg:py-4" dir="rtl">
        <div className="flex items-center w-full gap-2 lg:gap-4">
          {/* Motivational Banner */}
          <div className="shrink-0">
            <MotivationalBanner userName={user.fullName} userId={user.id} />
          </div>

          {/* Divider */}
          <div className="w-px h-12 lg:h-16 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* User Card - Line Style */}
          <div className="flex-1 min-w-0" data-tour="my-user-card">
            <UserCardLine
              user={user}
              taskCounts={personalStats}
              onUserClick={() => onUserClick?.()}
            />
          </div>
        </div>
      </div>

      {/* Task Brief - Takes available space with flex-1 */}
      <div className="flex-1 overflow-hidden min-h-0">
        <TaskBrief tasks={tasks} />
      </div>

      {/* Team Statistics - Fixed at bottom, aligned with ActivityFeedBox */}
      <div className="shrink-0 pt-2">
        <TaskStatusSummary
          open={teamStats.open}
          inProgress={teamStats.inProgress}
          pendingApproval={teamStats.pendingApproval}
          closed={teamStats.closed}
          title={getStatTitle(viewMode)}
          onStatusClick={onStatusSummaryClick}
        />
      </div>
    </div>
  );
};

export default UserView;
