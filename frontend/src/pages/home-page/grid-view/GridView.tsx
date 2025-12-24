import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";
import { type Task } from "../../../api/tasksApi";
import { ActivityFeedBox } from "./activity-feed-box";
import { AdminView } from "./admin-view";
import { UserView } from "./user-view";

interface GridViewProps {
  users: UserData[];
  tasks: Task[];
  viewMode?: "daily" | "weekly" | "monthly";
}

const GridView: React.FC<GridViewProps> = ({
  users,
  tasks,
  viewMode = "daily",
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
    <div className="flex gap-4 h-full p-4" dir="rtl">
      {/* Right Side - Main Content (65%) */}
      <div className="w-[65%] h-full overflow-hidden">
        {isAdmin ? (
          <AdminView
            users={users}
            tasks={tasks}
            viewMode={viewMode}
            onUserClick={handleUserClick}
            isUserClickable={isUserClickable}
          />
        ) : currentUser ? (
          <UserView
            user={currentUser}
            tasks={userTasks}
            viewMode={viewMode}
            onUserClick={() => handleUserClick(currentUser)}
          />
        ) : null}
      </div>

      {/* Left Side - Activity Feed (35%) */}
      <div className="w-[35%] h-full">
        <ActivityFeedBox />
      </div>
    </div>
  );
};

export default GridView;
