import React from "react";
import { User, Calendar } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";

interface TaskListItemProps {
  task: Task;
  users: UserData[];
  tags: SecondaryTagData[];
}

// Status badge styling - green for open, orange for progress, gray for closed
const getStatusStyle = (
  status?: string
): { bg: string; text: string; label: string } => {
  switch (status) {
    case "pending":
      return { bg: "bg-green-100", text: "text-green-700", label: "פתוח" };
    case "in_progress":
      return { bg: "bg-orange-100", text: "text-orange-700", label: "בטיפול" };
    case "completed":
      return { bg: "bg-slate-100", text: "text-slate-600", label: "סגור" };
    case "cancelled":
      return { bg: "bg-red-100", text: "text-red-700", label: "בוטל" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", label: "לא ידוע" };
  }
};

// Generate gradient for multiple user colors
const getGradientStyle = (colors: string[]): React.CSSProperties => {
  if (colors.length === 0) {
    return { backgroundColor: "#94A3B8" };
  }
  if (colors.length === 1) {
    return { backgroundColor: colors[0] };
  }
  const gradientStops = colors
    .map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100;
      return `${color} ${percentage}%`;
    })
    .join(", ");
  return { background: `linear-gradient(to bottom, ${gradientStops})` };
};

// Calculate days remaining until deadline
const getDaysRemaining = (
  timestamp?: number
): { text: string; color: string } => {
  if (!timestamp) return { text: "---", color: "text-slate-400" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(timestamp);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `באיחור ${Math.abs(diffDays)} ימים`, color: "text-red-500" };
  } else if (diffDays === 0) {
    return { text: "היום!", color: "text-red-500" };
  } else if (diffDays === 1) {
    return { text: "מחר", color: "text-orange-500" };
  } else if (diffDays <= 3) {
    return { text: `עוד ${diffDays} ימים`, color: "text-orange-500" };
  } else if (diffDays <= 7) {
    return { text: `עוד ${diffDays} ימים`, color: "text-blue-500" };
  } else {
    return { text: `עוד ${diffDays} ימים`, color: "text-slate-500" };
  }
};

const TaskListItem: React.FC<TaskListItemProps> = ({ task, users, tags }) => {
  const { isDarkMode } = useTheme();
  const statusStyle = getStatusStyle(task.status);

  // Get assigned users
  const assignedUsers = users.filter((user) =>
    task.responsibleUserIds?.includes(user.id)
  );

  // Get user colors for gradient
  const userColors = assignedUsers.map((user) => user.color);

  // Get task tags
  const taskTags = tags.filter((tag) => task.secondaryTagIds?.includes(tag.id));

  return (
    <div
      className={`
        flex items-center gap-4
        p-4 lg:p-5
        rounded-xl border
        transition-all duration-200
        hover:shadow-md cursor-pointer
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 hover:border-slate-600"
            : "bg-white border-slate-200 hover:border-slate-300"
        }
      `}
      dir="rtl"
    >
      {/* Color Border - Gradient for multiple users */}
      <div
        className="w-1.5 h-16 rounded-full shrink-0"
        style={getGradientStyle(userColors)}
      />

      {/* Task ID */}
      <div
        className={`shrink-0 w-16 lg:w-20 text-xs lg:text-sm font-mono text-center
          ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}
      >
        {task.id?.slice(-6) || "---"}
      </div>

      {/* Task Content - Title & Tags */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold text-sm lg:text-base truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          {task.title || "ללא כותרת"}
        </h3>
        {/* Tags */}
        {taskTags.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            {taskTags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: (tag.color || "#94A3B8") + "30",
                  color: tag.color || "#94A3B8",
                }}
              >
                {tag.name}
              </span>
            ))}
            {taskTags.length > 2 && (
              <span
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                +{taskTags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status Badge - Fixed width */}
      <div className="w-20 lg:w-24 shrink-0 flex justify-center">
        <span
          className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold
            ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Date - Fixed width - Shows days remaining */}
      {(() => {
        const daysInfo = getDaysRemaining(task.date);
        return (
          <div className="w-28 lg:w-32 shrink-0 flex items-center justify-center gap-1.5">
            <Calendar className={`w-4 h-4 ${daysInfo.color}`} />
            <span
              className={`text-xs lg:text-sm font-medium ${daysInfo.color}`}
            >
              {daysInfo.text}
            </span>
          </div>
        );
      })()}

      {/* Assigned Users - Fixed width */}
      <div className="w-40 lg:w-48 shrink-0 flex items-center gap-2">
        {assignedUsers.length > 0 ? (
          <>
            {/* Stacked Avatars */}
            <div className="flex -space-x-2 space-x-reverse">
              {assignedUsers.slice(0, 2).map((user, index) => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center"
                  style={{ backgroundColor: user.color, zIndex: 2 - index }}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              ))}
            </div>
            {/* User Name */}
            <div className="hidden lg:block min-w-0">
              <p
                className={`text-sm font-medium truncate
                  ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
              >
                {assignedUsers[0].fullName}
              </p>
              {assignedUsers.length > 1 && (
                <p
                  className={`text-xs
                    ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  +{assignedUsers.length - 1} נוספים
                </p>
              )}
            </div>
          </>
        ) : (
          <span
            className={`text-xs ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            לא משויך
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskListItem;
