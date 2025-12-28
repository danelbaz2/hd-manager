import React from "react";
import type { TaskHistoryEntry, UserData } from "./types";
import { getIconConfig } from "../../../../../components/modal/modal-task/history/historyConfig";
import { FIELD_LABELS, formatTime } from "./updateFormatters";
import { UserAvatar } from "./UserAvatar";
import { UpdateContent } from "./UpdateContent";

interface UpdateItemProps {
  entry: TaskHistoryEntry;
  taskTitle?: string;
  isDarkMode: boolean;
  users: UserData[];
  onClick?: () => void;
}

export const UpdateItem: React.FC<UpdateItemProps> = ({
  entry,
  taskTitle,
  isDarkMode,
  users,
  onClick,
}) => {
  const config = getIconConfig(entry);
  const title =
    entry.action === "DELETE" && entry.oldValues?.title
      ? (entry.oldValues.title as string)
      : taskTitle || "משימה";
  const user = users.find((u) => u.fullName === entry.updatedBy);
  const userColor = user?.color || "#94a3b8";
  const changedFields = entry.changes
    ? Object.keys(entry.changes).filter((k) =>
        Object.keys(FIELD_LABELS).includes(k)
      )
    : [];

  return (
    <div
      className={`flex items-start gap-3 cursor-pointer transition-all py-3 px-2 ${
        isDarkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
      }`}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span
            className={`font-semibold text-sm ${
              isDarkMode ? "text-white" : "text-slate-800"
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
          actionLabel={config.label}
        />
      </div>

      <div
        className={`shrink-0 text-xs font-medium ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {formatTime(entry.timestamp)}
      </div>
    </div>
  );
};
