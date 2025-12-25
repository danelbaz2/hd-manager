import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";

interface TaskCounts {
  open: number;
  inProgress: number;
  closed: number;
}

interface AdminUserCardProps {
  user: UserData;
  taskCounts: TaskCounts;
  onUserClick?: (user: UserData) => void;
  isClickable?: boolean;
}

const AdminUserCard: React.FC<AdminUserCardProps> = ({
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
        w-full rounded-xl overflow-hidden
        transition-all duration-300 ease-out group
        ${
          isClickable
            ? `cursor-pointer hover:shadow-lg hover:shadow-slate-500/10 hover:scale-[1.02] ${
                isDarkMode
                  ? "bg-slate-800 border border-slate-700 hover:border-slate-600"
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
              }`
            : `cursor-default ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-800/50"
                  : "bg-slate-100 border border-slate-300"
              }`
        }
      `}
    >
      {/* Top Section - Avatar, Name, Role */}
      <div className="pt-3 pb-2 px-2 flex flex-col items-center gap-1">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 group-hover:scale-105
            ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User
              className={`w-5 h-5 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
            />
          )}
        </div>

        {/* Name */}
        <h3
          className={`text-xs font-bold truncate w-full text-center transition-colors duration-300 ${
            isDarkMode
              ? "text-white group-hover:text-blue-300"
              : "text-slate-800 group-hover:text-blue-600"
          }`}
        >
          {user.fullName}
        </h3>
      </div>

      {/* Bottom Section - Task Counts Bar */}
      <div className="grid grid-cols-3 w-full">
        {/* Open (פתוח) - Green */}
        <div
          className={`flex flex-col items-center py-1.5 transition-colors duration-200
            ${
              isDarkMode ? " hover:bg-emerald-500/25" : "hover:bg-emerald-100"
            }`}
        >
          <span
            className={`text-sm font-bold ${
              isDarkMode ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            {taskCounts.open}
          </span>
          <span
            className={`text-[8px] font-medium ${
              isDarkMode ? "text-emerald-400/80" : "text-emerald-600/80"
            }`}
          >
            פתוח
          </span>
        </div>

        {/* In Progress (בטיפול) - Yellow/Amber */}
        <div
          className={`flex flex-col items-center py-1.5 transition-colors duration-200
            ${isDarkMode ? " hover:bg-amber-500/25" : " hover:bg-amber-100"}`}
        >
          <span
            className={`text-sm font-bold ${
              isDarkMode ? "text-amber-400" : "text-amber-600"
            }`}
          >
            {taskCounts.inProgress}
          </span>
          <span
            className={`text-[8px] font-medium ${
              isDarkMode ? "text-amber-400/80" : "text-amber-600/80"
            }`}
          >
            בטיפול
          </span>
        </div>

        {/* Closed (סגור) - Gray */}
        <div
          className={`flex flex-col items-center py-1.5 transition-colors duration-200
            ${isDarkMode ? "hover:bg-slate-600/50" : " hover:bg-slate-200"}`}
        >
          <span
            className={`text-sm font-bold ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {taskCounts.closed}
          </span>
          <span
            className={`text-[8px] font-medium ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            סגור
          </span>
        </div>
      </div>
    </button>
  );
};

export default AdminUserCard;
