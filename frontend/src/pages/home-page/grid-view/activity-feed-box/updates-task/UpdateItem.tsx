import React, { memo, useMemo } from "react";
import type {
  TaskHistoryEntry,
  PrimaryTagData,
  SecondaryTagData,
} from "./types";
import { getIconConfig } from "../../../../../components/modal/modal-task/history/historyConfig";
import { FIELD_LABELS, formatTime } from "./updateFormatters";
import { UserAvatar } from "./UserAvatar";
import { UpdateContent } from "./UpdateContent";
import { useUsersQuery } from "../../../../../api/queries";
import { mapUsersToUserData } from "../../../../../api/typeMappers";
import { useNewMessageHighlight } from "../update-team/hooks/useNewMessageHighlight";

interface UpdateItemProps {
  entry: TaskHistoryEntry;
  taskTitle?: string;
  isDarkMode: boolean;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  onClick?: () => void;
  isNew?: boolean;
  lastSeen?: number;
  currentUserId?: string;
}

const UpdateItemComponent: React.FC<UpdateItemProps> = ({
  entry,
  taskTitle,
  isDarkMode,
  primaryTags,
  secondaryTags,
  onClick,
  isNew: propIsNew = false,
  lastSeen = 0,
  currentUserId,
}) => {
  // Use React Query hook directly to always get latest user data
  const { data: usersData = [] } = useUsersQuery();
  const users = useMemo(() => mapUsersToUserData(usersData), [usersData]);

  const config = getIconConfig(entry);
  const title =
    entry.action === "DELETE" && entry.oldValues?.title
      ? (entry.oldValues.title as string)
      : taskTitle || "משימה";

  // Find user by fullName - now using fresh data from context
  // Use case-insensitive, trimmed comparison for robustness
  const normalizedUpdatedBy = entry.updatedBy?.trim().toLowerCase() || "";
  const user = users.find(
    (u) => u.fullName?.trim().toLowerCase() === normalizedUpdatedBy
  );
  const userColor = user?.color || "#94a3b8";
  const changedFields = entry.changes
    ? Object.keys(entry.changes).filter(
      (k) => Object.keys(FIELD_LABELS).includes(k) || k === "optionals"
    )
    : [];

  // Check if the current user is the author - don't show NEW for own actions
  // Identify by name since history uses updatedBy name, not ID
  const isSender = useMemo(() => {
    if (!currentUserId) return false;
    // If we found a user object, compare IDs
    if (user?.id === currentUserId) return true;
    // Fallback: compare names if current user data is available (needs extra lookup if not passed)
    // Ideally we rely on the matched user.
    return false;
  }, [currentUserId, user]);

  const { isHighlighted, showBadge } = useNewMessageHighlight({
    timestamp: entry.timestamp,
    lastSeen,
    propIsNew,
    isSender,
  });

  return (
    <div
      className={`relative flex items-start gap-3 cursor-pointer transition-all duration-[2000ms] ease-out py-3 px-2 overflow-hidden ${isHighlighted
          ? isDarkMode
            ? "bg-blue-900/20 hover:bg-blue-900/30 animate-slideInHighlight"
            : "bg-blue-50/80 hover:bg-blue-100/80 animate-slideInHighlight"
          : isDarkMode
            ? "hover:bg-slate-700/30"
            : "hover:bg-slate-50"
        }`}
      style={
        isHighlighted
          ? {
            borderRight: `4px solid ${isDarkMode ? "#60a5fa" : "#3b82f6"}`,
            boxShadow: isDarkMode
              ? "0 0 15px rgba(96, 165, 250, 0.15)"
              : "0 0 15px rgba(59, 130, 246, 0.1)",
          }
          : {
            borderRight: "4px solid transparent",
            boxShadow: "none",
          }
      }
      dir="rtl"
      onClick={onClick}
    >
      <UserAvatar
        user={user}
        userName={entry.updatedBy}
        userColor={userColor}
        actionIcon={config.icon}
        actionColor={config.color}
        isDarkMode={isDarkMode}
      />

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center flex-wrap gap-2 mb-0.5">
          {showBadge && (
            <span
              className={`text-[10px] font-bold rounded overflow-hidden whitespace-nowrap transition-all duration-[2000ms] ease-out ${isHighlighted
                  ? "opacity-100 animate-pulseFadeOut max-w-[50px] px-1.5 py-0.5"
                  : "opacity-0 max-w-0 px-0 py-0 border-0"
                } ${isDarkMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                }`}
              style={isHighlighted ? {} : { transform: "scale(0.8)" }}
            >
              חדש
            </span>
          )}
          <span
            className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-slate-800"
              }`}
          >
            {entry.updatedBy}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <UpdateContent
          entry={entry}
          title={title}
          changedFields={changedFields}
          isDarkMode={isDarkMode}
          users={users}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          actionLabel={config.label}
        />
      </div>

      <div
        className={`shrink-0 text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
      >
        {formatTime(entry.timestamp)}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent updates
export const UpdateItem = memo(UpdateItemComponent);
