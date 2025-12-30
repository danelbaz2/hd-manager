import React from "react";
import { User, Calendar } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
  getTextColor,
} from "../../../schemas/tagTypes";
import {
  getStatusStyle,
  getGradientStyle,
  getDaysRemaining,
} from "./taskItemUtils";
import { TagBadge } from "../../../components/tags-tooltip";

interface TaskListItemProps {
  task: Task;
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  onTaskClick?: (task: Task) => void;
}

/**
 * TaskListItem - Individual task row in the daily/list view
 * Refactored to use shared utility functions from taskItemUtils.ts
 */
const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  users,
  primaryTags,
  secondaryTags,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const statusStyle = getStatusStyle(task.status);

  // Get assigned users
  const assignedUsers = users.filter((user) =>
    task.responsibleUserIds?.includes(user.id)
  );

  // Get user colors for gradient
  const userColors = assignedUsers.map((user) => user.color);

  // Get both primary and secondary tags for this task
  const taskPrimaryTags = primaryTags.filter((t) =>
    task.primaryTagIds?.includes(t.id)
  );
  const taskSecondaryTags = secondaryTags.filter((t) =>
    task.secondaryTagIds?.includes(t.id)
  );
  const allTags = [...taskPrimaryTags, ...taskSecondaryTags];

  return (
    <div
      className={`
        flex items-center gap-2 lg:gap-4 p-3 lg:p-5 rounded-xl border
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isDarkMode
          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
          : "bg-white border-slate-200 hover:border-slate-300"
        }
      `}
      dir="rtl"
      onClick={() => onTaskClick?.(task)}
    >
      {/* Color Border - Gradient for multiple users */}
      <div
        className="w-1 lg:w-1.5 h-12 lg:h-16 rounded-full shrink-0"
        style={getGradientStyle(userColors)}
      />

      {/* Task ID - Hidden on small screens */}
      <div
        className={`hidden md:block shrink-0 w-14 lg:w-20 text-xs lg:text-sm font-mono text-center
          ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}
      >
        {task.id?.slice(-6) || "---"}
      </div>

      {/* Task Content - Title only */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold text-sm lg:text-base truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          {task.title || "ללא כותרת"}
        </h3>
      </div>

      {/* Tags Column - Hidden on small/medium screens */}
      <div className="hidden lg:flex w-24 lg:w-32 shrink-0 flex-wrap items-center justify-center gap-1">
        {allTags.length > 0 ? (
          <>
            {allTags.slice(0, 2).map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color || "#94A3B8"}
                textColor={getTextColor(tag.color || "#94A3B8")}
                description={tag.description}
                size="sm"
              />
            ))}
            {allTags.length > 2 && (
              <span
                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                +{allTags.length - 2}
              </span>
            )}
          </>
        ) : (
          <span
            className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
          >
            ---
          </span>
        )}
      </div>

      {/* Status Badge */}
      <div className="w-16 lg:w-24 shrink-0 flex justify-center">
        <span
          className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-semibold
            ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Date - Shows days remaining - Hidden on small screens */}
      {(() => {
        const daysInfo = getDaysRemaining(task.date);
        return (
          <div className="hidden md:flex w-20 lg:w-32 shrink-0 items-center justify-center gap-1 lg:gap-1.5">
            <Calendar className={`w-3 h-3 lg:w-4 lg:h-4 ${daysInfo.color}`} />
            <span
              className={`text-xs lg:text-sm font-medium ${daysInfo.color}`}
            >
              {daysInfo.text}
            </span>
          </div>
        );
      })()}

      {/* Assigned Users - Hidden on very small screens */}
      <div className="hidden sm:flex w-24 lg:w-40 shrink-0 items-center gap-1 lg:gap-2">
        {assignedUsers.length > 0 ? (
          <>
            <div className="flex -space-x-2 space-x-reverse">
              {assignedUsers.slice(0, 2).map((user, index) => (
                <div
                  key={user.id}
                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center"
                  style={{ backgroundColor: user.color, zIndex: 2 - index }}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden lg:block min-w-0">
              <p
                className={`text-sm font-medium truncate ${isDarkMode ? "text-slate-200" : "text-slate-700"
                  }`}
              >
                {assignedUsers[0].fullName}
              </p>
              {assignedUsers.length > 1 && (
                <p
                  className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                  +{assignedUsers.length - 1} נוספים
                </p>
              )}
            </div>
          </>
        ) : (
          <span
            className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"
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
