/**
 * HistoryEntry - Individual history entry with timeline styling
 */
import React from "react";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import { getIconConfig, type ActionConfigItem } from "./historyConfig";

interface HistoryEntryProps {
  entry: TaskHistoryEntry;
  isLast: boolean;
  isDarkMode: boolean;
  user?: UserData;
  getActionDescription: (
    entry: TaskHistoryEntry,
    config: ActionConfigItem
  ) => React.ReactNode;
  isNew?: boolean; // For animation
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes}, ${day}.${month}.${year}`;
};

const HistoryEntry: React.FC<HistoryEntryProps> = ({
  entry,
  isLast,
  isDarkMode,
  user,
  getActionDescription,
  isNew = false,
}) => {
  // Use dynamic icon config based on changed fields
  const config = getIconConfig(entry);
  const Icon = config.icon;

  return (
    <div
      className={`
        relative flex gap-3 
        ${isNew ? "animate-slideIn" : ""}
      `}
    >
      {/* Timeline column with icon and connecting line */}
      <div className="flex flex-col items-center shrink-0">
        {/* Icon */}
        <div
          className={`
            relative w-7 h-7 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isNew ? "z-50 scale-110 shadow-md" : "z-10"}
          `}
          style={{
            backgroundColor: config.bgColor,
            border: `2px solid ${config.color}`,
            boxShadow: isNew ? `0 4px 12px ${config.color}40` : undefined,
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
        </div>
        {/* Connecting line to next icon */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[40px] ${isDarkMode ? "bg-slate-600" : "bg-slate-300"
              }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        {/* User and time */}
        <div className="flex items-center gap-3 mb-1.5">
          <span
            className="text-sm font-medium px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: user?.color
                ? `${user.color}30`
                : isDarkMode
                  ? "#475569"
                  : "#E2E8F0",
              color: isDarkMode ? "#F8FAFC" : "#1E293B",
            }}
          >
            {entry.updatedBy}
          </span>
          <span
            className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
          >
            {formatDateTime(entry.timestamp)}
          </span>
        </div>

        {/* Action description */}
        <div
          className={`
            w-fit max-w-full p-3 rounded-xl text-sm transition-all duration-300
            whitespace-pre-wrap break-words
            ${isDarkMode
              ? "bg-slate-700/50 text-slate-300"
              : "bg-slate-100 text-slate-700"
            }
            ${isNew
              ? "ring-2 ring-blue-500/40 shadow-lg " + (isDarkMode ? "shadow-blue-500/10" : "shadow-blue-500/20")
              : ""
            }
          `}
        >
          {getActionDescription(entry, config)}
        </div>
      </div>
    </div >
  );
};

export default HistoryEntry;
