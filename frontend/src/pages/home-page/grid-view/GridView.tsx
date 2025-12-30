import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type TeamMessage } from "../../../schemas/teamMessageTypes";
import { ActivityFeedBox } from "./activity-feed-box";
import { AdminView } from "./admin-view";
import { UserView } from "./user-view";

interface GridViewProps {
  users: UserData[];
  tasks: Task[];
  viewMode?: "daily" | "weekly" | "monthly";
  teamUpdatesOverride?: TeamMessage[];
  onStatusSummaryClick?: (status: TaskStatus) => void;
}

const GridView: React.FC<GridViewProps> = ({
  users,
  tasks,
  viewMode = "daily",
  teamUpdatesOverride,
  onStatusSummaryClick,
}) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";

  // Handle user card click - navigate to tasks page
  const handleUserClick = (user: UserData) => {
    const canClick = isAdmin || user.id === authUser?.id;
    if (canClick) {
      navigate("/tasks", {
        state: { selectedUserId: user.id, userName: user.fullName },
      });
    }
  };

  // Check if user card is clickable
  const isUserClickable = (userId: string): boolean =>
    isAdmin || userId === authUser?.id;

  // Get current user data for regular user view
  const currentUser = users.find((u) => u.id === authUser?.id);
  const userTasks = authUser
    ? tasks.filter((t) => t.responsibleUserIds?.includes(authUser.id))
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 h-full" dir="rtl">
      {/* Right Side - Main Content (full width on mobile, 65% on large screens) */}
      <div className="w-full lg:w-[65%] h-auto lg:h-full overflow-hidden min-h-0 pb-10 lg:pb-12">
        {isAdmin ? (
          <AdminView
            users={users}
            tasks={tasks}
            viewMode={viewMode}
            onUserClick={handleUserClick}
            isUserClickable={isUserClickable}
            onStatusSummaryClick={onStatusSummaryClick}
          />
        ) : currentUser ? (
          <UserView
            user={currentUser}
            tasks={userTasks}
            allTasks={tasks}
            viewMode={viewMode}
            onUserClick={() => handleUserClick(currentUser)}
            onStatusSummaryClick={onStatusSummaryClick}
          />
        ) : null}
      </div>

      {/* Left Side - Activity Feed (full width on mobile, 35% on large screens) */}
      <div className="w-full lg:w-[35%] h-[50vh] lg:h-full pb-10 lg:pb-12" data-tour="activity-feed">
        <ActivityFeedBox
          tasksOverride={tasks}
          usersOverride={users}
          teamUpdatesOverride={teamUpdatesOverride}
        />
      </div>
    </div>
  );
};

export default GridView;
