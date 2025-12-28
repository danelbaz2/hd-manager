import React from "react";
import { User } from "lucide-react";
import { useTheme, useAuth } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";
import { useTour } from "../../../../components/demos/tour-provider";

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
  const { user: authUser } = useAuth();
  const { state: tourState, completeTour } = useTour();
  const isCurrentUser = authUser?.id === user.id;

  const handleClick = () => {
    if (isClickable) {
      // If tour is active on home page and user clicks their card, complete the tour
      if (
        tourState.isActive &&
        tourState.currentPageId === "home" &&
        isCurrentUser
      ) {
        completeTour();
      }
      onUserClick?.(user);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`
        w-full h-38 rounded-xl overflow-hidden flex flex-col
        transition-all duration-300 ease-out group 
        ${
          isClickable
            ? `cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                isDarkMode
                  ? "bg-slate-800 border border-slate-700 hover:border-slate-500"
                  : "bg-white border border-slate-200 shadow-sm"
              }`
            : `cursor-default ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-800/50"
                  : "bg-slate-100 border border-slate-300"
              }`
        }
      `}
      style={
        {
          // Use CSS custom property for hover effect
          "--user-color": user.color,
          "--user-color-light": `${user.color}20`, // 20 = 12% opacity
          "--user-color-dark": `${user.color}30`, // 30 = 19% opacity
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? `${user.color}25` // ~15% opacity for dark mode
            : `${user.color}15`; // ~8% opacity for light mode
          e.currentTarget.style.borderColor = user.color;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.borderColor = "";
        }
      }}
    >
      {/* Top Section - Avatar, Name, Nickname */}
      <div className="flex-1 pt-3 pb-1 px-4 flex flex-col items-center justify-center gap-1">
        {/* Avatar */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-300 group-hover:scale-105
            ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}`}
          style={{
            border: `3px solid ${user.color}`,
            boxShadow: `0 0 0 2px ${
              isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)"
            }`,
          }}
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User
              className={`w-7 h-7 ${
                isDarkMode ? "text-slate-300" : "text-slate-500"
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

        {/* Nickname */}
        <span
          className={`text-[10px] truncate w-full text-center ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {user.nickname || "משתמש"}
        </span>
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
