import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";

interface TaskCounts {
  open: number;
  inProgress: number;
  closed: number;
}

interface UserCardProps {
  user: UserData;
  taskCounts: TaskCounts;
  onUserClick?: (user: UserData) => void;
  isClickable?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  taskCounts,
  onUserClick,
  isClickable = true,
}) => {
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    if (isClickable) {
      onUserClick?.(user);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`
        w-full p-3 lg:p-4 rounded-xl border transition-all duration-200
        ${
          isClickable
            ? `hover:shadow-md hover:scale-[1.02] cursor-pointer
           ${
             isDarkMode
               ? "bg-slate-800 border-slate-700 hover:border-slate-600"
               : "bg-white border-slate-200 hover:border-slate-300"
           }`
            : `cursor-default
           ${
             isDarkMode
               ? "bg-slate-800/50 border-slate-800/50"
               : "bg-slate-100 border-slate-300"
           }`
        }
      `}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <div
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: user.color }}
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center mb-2">
        <h3
          className={`font-bold text-sm lg:text-base truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          {user.fullName}
        </h3>
      </div>

      {/* Task Counts */}
      <div
        className={`flex items-center justify-between pt-2 border-t
          ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
      >
        <TaskCount
          label="פתוח"
          count={taskCounts.open}
          color="text-green-500"
        />
        <TaskCount
          label="בטיפול"
          count={taskCounts.inProgress}
          color="text-amber-500"
        />
        <TaskCount
          label="סגור"
          count={taskCounts.closed}
          color="text-slate-400"
        />
      </div>
    </button>
  );
};

// Sub-component for task count display
const TaskCount: React.FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="text-center flex-1">
      <p className={`${color} font-bold text-sm lg:text-base`}>{count}</p>
      <p
        className={`text-[10px] ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
};

export default UserCard;
