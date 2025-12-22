import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";
import { type Task } from "../../../api/tasksApi";
import UserCardGrid from "./UserCardGrid";

interface GridViewProps {
  users: UserData[];
  tasks: Task[];
}

/**
 * GridView - Shows user cards with task counts
 * Same view for daily, weekly, and monthly modes
 */
const GridView: React.FC<GridViewProps> = ({ users, tasks }) => {
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
  const isUserClickable = (userId: string): boolean => {
    return isAdmin || userId === authUser?.id;
  };

  return (
    <UserCardGrid
      users={users}
      tasks={tasks}
      onUserClick={handleUserClick}
      isUserClickable={isUserClickable}
    />
  );
};

export default GridView;
