import React from "react";
import { User, Circle, Clock, CheckCircle2 } from "lucide-react";
import { useTheme, useAuth } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";
import { useTour } from "../../../../components/demos/tour-provider";

interface TaskCounts {
  open: number;
  inProgress: number;
  closed: number;
}

interface UserCardLineProps {
  user: UserData;
  taskCounts: TaskCounts;
  onUserClick?: (user: UserData) => void;
  isClickable?: boolean;
}

/**
 * Line-style UserCard for User View
 * Displays user info in a horizontal line layout - no progress bar, no hover background
 */
const UserCardLine: React.FC<UserCardLineProps> = ({
  user,
  taskCounts,
  onUserClick,
  isClickable = true,
}) => {
  const { isDarkMode } = useTheme();
  const { user: authUser } = useAuth();
  const { state: tourState, completeTour } = useTour();
  const isCurrentUser = (authUser as any)?.id === user.id; // Type cast if necessary, or just authUser?.id

  const handleClick = () => {
    if (isClickable) {
      // If tour is active on home page and user clicks their card, complete the tour
      if (tourState.isActive && tourState.currentPageId === "home" && isCurrentUser) {
        completeTour();
      }
      onUserClick?.(user);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      data-tour={isCurrentUser ? "my-user-card" : undefined}
      className={`
        w-full py-4 px-6 transition-all duration-300 ease-out group rounded-xl
        ${isClickable ? "cursor-pointer" : "cursor-default"}
      `}
      style={
        {
          "--user-color": user.color,
          "--user-color-light": `${user.color}15`,
          "--user-color-medium": `${user.color}30`,
        } as React.CSSProperties
      }
      dir="rtl"
    >
      {/* Hover effects using user color */}
      <style>{`
        .user-card-hover:hover {
          background: var(--user-color-light);
        }
        .group:hover .user-name-hover {
          color: var(--user-color) !important;
        }
        .group:hover .user-ring-hover {
          --tw-ring-color: var(--user-color-medium) !important;
        }
      `}</style>

      {/* Line Layout - Horizontal */}
      <div className="flex items-center gap-6 user-card-hover rounded-xl -mx-4 -my-2 px-4 py-2 transition-all duration-300">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center 
              ring-2 ring-offset-2 transition-all duration-300 user-ring-hover"
            style={{
              backgroundColor: user.color,
              ["--tw-ring-color" as string]: isDarkMode ? "rgb(71 85 105)" : "rgb(226 232 240)",
              ["--tw-ring-offset-color" as string]: "transparent",
            }}
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white drop-shadow-sm" />
            )}
          </div>

          {/* Online indicator */}
          <div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full 
              bg-green-500 border-2 animate-pulse
              ${isDarkMode ? "border-slate-900" : "border-white"}`}
          />
        </div>

        {/* Name - hover color based on user color */}
        <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
          <h3
            className={`text-lg font-semibold truncate transition-colors duration-300 user-name-hover ${isDarkMode ? "text-white" : "text-slate-800"
              }`}
          >
            {user.fullName}
          </h3>
        </div>

        {/* Divider */}
        <div
          className={`w-px h-10 ${isDarkMode ? "bg-slate-700" : "bg-slate-200"
            }`}
        />

        {/* Task Counts - Inline */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Open */}
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-emerald-500">
                {taskCounts.open}
              </span>
              <span
                className={`text-[10px] ${isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                פתוח
              </span>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-amber-500">
                {taskCounts.inProgress}
              </span>
              <span
                className={`text-[10px] ${isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                בטיפול
              </span>
            </div>
          </div>

          {/* Closed */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col items-start">
              <span
                className={`text-lg font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                {taskCounts.closed}
              </span>
              <span
                className={`text-[10px] ${isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                סגור
              </span>
            </div>
          </div>
        </div>

        {/* Arrow indicator for clickable */}
        {isClickable && (
          <div
            className={`shrink-0 transition-transform duration-300 group-hover:-translate-x-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};

export default UserCardLine;
