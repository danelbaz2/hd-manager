import React from "react";
import { User, Circle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
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
  size?: "compact" | "normal" | "large";
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  taskCounts,
  onUserClick,
  isClickable = true,
  size = "normal",
}) => {
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    if (isClickable) {
      onUserClick?.(user);
    }
  };

  // Size-based styles
  const sizeStyles = {
    compact: {
      padding: "p-3",
      avatar: "w-10 h-10",
      avatarIcon: "w-4 h-4",
      avatarRing: "w-12 h-12",
      nameText: "text-sm",
      countText: "text-base",
      labelText: "text-[9px]",
      gap: "gap-2",
      borderPt: "pt-2",
      iconSize: "w-3 h-3",
    },
    normal: {
      padding: "p-4",
      avatar: "w-12 h-12",
      avatarIcon: "w-5 h-5",
      avatarRing: "w-14 h-14",
      nameText: "text-base font-semibold",
      countText: "text-lg",
      labelText: "text-[10px]",
      gap: "gap-3",
      borderPt: "pt-3",
      iconSize: "w-3.5 h-3.5",
    },
    large: {
      padding: "p-5",
      avatar: "w-16 h-16",
      avatarIcon: "w-7 h-7",
      avatarRing: "w-20 h-20",
      nameText: "text-lg font-bold",
      countText: "text-xl",
      labelText: "text-xs",
      gap: "gap-4",
      borderPt: "pt-4",
      iconSize: "w-4 h-4",
    },
  };

  const styles = sizeStyles[size];

  // Calculate total and completion percentage
  const total = taskCounts.open + taskCounts.inProgress + taskCounts.closed;
  const completionRate =
    total > 0 ? Math.round((taskCounts.closed / total) * 100) : 0;

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`
        relative w-full ${styles.padding} rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out group
        ${
          isClickable
            ? `cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700/50 hover:border-blue-500/30"
                  : "bg-gradient-to-br from-white via-white to-slate-50 border-slate-200/80 hover:border-blue-400/40"
              }`
            : `cursor-default ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-800/50"
                  : "bg-slate-100 border-slate-300"
              }`
        }
      `}
    >
      {/* Animated gradient overlay on hover */}
      {isClickable && (
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"
              : "bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-cyan-400/5"
          }`}
        />
      )}

      {/* Subtle glow effect */}
      <div
        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-opacity duration-500 ${
          isClickable ? "group-hover:opacity-60" : ""
        } opacity-0 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-400/15"}`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar + Name Section */}
        <div className={`flex flex-col items-center ${styles.gap} mb-4`}>
          {/* Avatar with animated ring */}
          <div className="relative">
            {/* Animated gradient ring */}
            <div
              className={`absolute inset-0 rounded-full ${
                styles.avatarRing
              } -m-1 
                bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 
                opacity-0 group-hover:opacity-100 transition-all duration-500
                ${isClickable ? "group-hover:animate-spin-slow" : ""}`}
              style={{
                animationDuration: "4s",
                padding: "2px",
              }}
            />

            {/* Avatar container */}
            <div
              className={`${
                styles.avatar
              } relative shrink-0 rounded-full flex items-center justify-center 
                ring-2 ring-offset-2 transition-all duration-300
                ${
                  isDarkMode
                    ? "ring-slate-700 ring-offset-slate-800 group-hover:ring-blue-500/50"
                    : "ring-slate-200 ring-offset-white group-hover:ring-blue-400/50"
                }`}
              style={{ backgroundColor: user.color }}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User
                  className={`${styles.avatarIcon} text-white drop-shadow-sm`}
                />
              )}
            </div>

            {/* Online indicator */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full 
                bg-green-500 border-2 animate-pulse
                ${isDarkMode ? "border-slate-800" : "border-white"}`}
            />
          </div>

          {/* Name with subtle gradient */}
          <h3
            className={`${styles.nameText} truncate w-full text-center 
              bg-clip-text transition-all duration-300 ${
                isDarkMode
                  ? "text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400"
                  : "text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600"
              }`}
          >
            {user.fullName}
          </h3>

          {/* Nickname */}
          <span
            className={`text-[10px] truncate w-full text-center -mt-1 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {user.nickname || "משתמש"}
          </span>

          {/* Completion badge */}
          {total > 0 && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium
              transition-all duration-300 ${
                isDarkMode
                  ? "bg-slate-700/50 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>{completionRate}% הושלם</span>
            </div>
          )}
        </div>

        {/* Task Counts */}
        <div
          className={`grid grid-cols-3 gap-2 ${styles.borderPt} 
            border-t transition-colors duration-300 ${
              isDarkMode ? "border-slate-700/50" : "border-slate-100"
            }`}
        >
          <TaskCountCard
            label="פתוח"
            count={taskCounts.open}
            icon={Circle}
            gradientFrom="from-emerald-500"
            gradientTo="to-green-400"
            bgColor={isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50"}
            size={size}
          />
          <TaskCountCard
            label="בטיפול"
            count={taskCounts.inProgress}
            icon={Clock}
            gradientFrom="from-amber-500"
            gradientTo="to-orange-400"
            bgColor={isDarkMode ? "bg-amber-500/10" : "bg-amber-50"}
            size={size}
          />
          <TaskCountCard
            label="סגור"
            count={taskCounts.closed}
            icon={CheckCircle2}
            gradientFrom="from-slate-500"
            gradientTo="to-slate-400"
            bgColor={isDarkMode ? "bg-slate-500/10" : "bg-slate-100"}
            size={size}
          />
        </div>
      </div>
    </button>
  );
};

// Enhanced sub-component for task count display
interface TaskCountCardProps {
  label: string;
  count: number;
  icon: React.ElementType;
  gradientFrom: string;
  gradientTo: string;
  bgColor: string;
  size: "compact" | "normal" | "large";
}

const TaskCountCard: React.FC<TaskCountCardProps> = ({
  label,
  count,
  icon: Icon,
  gradientFrom,
  gradientTo,
  bgColor,
  size,
}) => {
  const { isDarkMode } = useTheme();

  const sizeStyles = {
    compact: {
      count: "text-base",
      label: "text-[9px]",
      icon: "w-3 h-3",
      padding: "p-1.5",
    },
    normal: {
      count: "text-lg",
      label: "text-[10px]",
      icon: "w-3.5 h-3.5",
      padding: "p-2",
    },
    large: {
      count: "text-xl",
      label: "text-xs",
      icon: "w-4 h-4",
      padding: "p-2.5",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`text-center ${styles.padding} rounded-xl ${bgColor} 
      transition-all duration-300 hover:scale-105 group/card`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center mb-1">
        <Icon
          className={`${styles.icon} bg-gradient-to-r ${gradientFrom} ${gradientTo} 
          bg-clip-text text-transparent transition-transform duration-300 
          group-hover/card:rotate-12`}
          style={{
            stroke: `url(#gradient-${label})`,
          }}
        />
      </div>

      {/* Count with gradient */}
      <p
        className={`font-bold ${styles.count} bg-gradient-to-r ${gradientFrom} ${gradientTo} 
        bg-clip-text text-transparent`}
      >
        {count}
      </p>

      {/* Label */}
      <p
        className={`${styles.label} font-medium ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
};

export default UserCard;
