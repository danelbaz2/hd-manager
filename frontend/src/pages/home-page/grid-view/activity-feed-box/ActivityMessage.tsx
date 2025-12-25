import React from "react";
import { ArrowLeft } from "lucide-react";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../../../../schemas/tagTypes";
import { formatTime } from "./activityUtils";
import { getIconConfig } from "../../../../components/modal/modal-task/history/historyConfig";

interface ActivityMessageProps {
  entry: TaskHistoryEntry;
  taskTitle?: string;
  isDarkMode: boolean;
  users: UserData[];
  primaryTags?: PrimaryTagData[];
  secondaryTags?: SecondaryTagData[];
  isTaskDeleted?: boolean;  // True if the task no longer exists
  onClick?: () => void;
}

// Status and priority labels
const STATUS_LABELS: Record<string, string> = {
  pending: "פתוח",
  in_progress: "בטיפול",
  completed: "הושלם",
  cancelled: "בוטל",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

const FIELD_LABELS: Record<string, string> = {
  title: "כותרת",
  description: "תיאור",
  priority: "עדיפות",
  status: "סטטוס",
  date: "תאריך",
  deadline: "תאריך יעד",
  responsibleUserIds: "אחראים",
  primaryTagIds: "קטגוריות",
  secondaryTagIds: "תגיות",
};

// Helper to get tag names
const getPrimaryTagNames = (tagIds: string[], tags: PrimaryTagData[]): string[] => {
  return tagIds
    .map((id) => tags.find((t) => t.id === id)?.name)
    .filter((name): name is string => !!name);
};

const getSecondaryTagNames = (tagIds: string[], tags: SecondaryTagData[]): string[] => {
  return tagIds
    .map((id) => tags.find((t) => t.id === id)?.name)
    .filter((name): name is string => !!name);
};

// Format value for display
const formatValue = (
  field: string,
  value: unknown,
  users: UserData[],
  primaryTags: PrimaryTagData[] = [],
  secondaryTags: SecondaryTagData[] = []
): string => {
  if (value === null || value === undefined) return "ריק";

  switch (field) {
    case "priority":
      return PRIORITY_LABELS[value as string] || String(value);
    case "status":
      return STATUS_LABELS[value as string] || String(value);
    case "date":
    case "deadline":
      return value ? new Date(value as number).toLocaleDateString("he-IL") : "לא נקבע";
    case "responsibleUserIds": {
      const ids = value as string[];
      const names = ids
        .map((id) => users.find((u) => u.id === id)?.fullName)
        .filter((n): n is string => !!n);
      return names.length > 0 ? names.join(", ") : "אין אחראים";
    }
    case "primaryTagIds": {
      const tagIds = value as string[];
      const names = getPrimaryTagNames(tagIds, primaryTags);
      return names.length > 0 ? names.join(", ") : "אין קטגוריות";
    }
    case "secondaryTagIds": {
      const tagIds = value as string[];
      const names = getSecondaryTagNames(tagIds, secondaryTags);
      return names.length > 0 ? names.join(", ") : "אין תגיות";
    }
    default:
      return String(value);
  }
};

export const ActivityMessage: React.FC<ActivityMessageProps> = ({
  entry,
  taskTitle,
  isDarkMode,
  users,
  primaryTags = [],
  secondaryTags = [],
  isTaskDeleted = false,
  onClick,
}) => {
  // Use dynamic icon config based on changed fields
  const config = getIconConfig(entry);
  const Icon = config.icon;

  // For DELETE actions, use the title from oldValues if available
  const title = entry.action === "DELETE" && entry.oldValues?.title
    ? (entry.oldValues.title as string)
    : (taskTitle || "משימה");

  // Find user by fullName
  const user = users.find((u) => u.fullName === entry.updatedBy);
  const userColor = user?.color || "#94a3b8";

  // Get changed fields (excluding base metadata)
  const changedFields = entry.changes
    ? Object.keys(entry.changes).filter((k) =>
      ["title", "description", "priority", "status", "date", "deadline", "responsibleUserIds", "primaryTagIds", "secondaryTagIds"].includes(k)
    )
    : [];

  // Render content based on action type
  const renderContent = () => {
    // NOTE action - show the note text
    if (entry.action === "NOTE" && entry.note) {
      return (
        <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          {entry.note}
        </p>
      );
    }

    // CREATE action
    if (entry.action === "CREATE") {
      return (
        <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          יצר את המשימה "<span className="font-medium">{title}</span>"
        </p>
      );
    }

    // DELETE action - show the deleted task title
    if (entry.action === "DELETE") {
      return (
        <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          מחק את המשימה "<span className="font-medium text-red-500">{title}</span>"
        </p>
      );
    }

    // UPDATE/IN_PROGRESS/CLOSE - show old → new values
    if (changedFields.length > 0) {
      return (
        <div className="space-y-1">
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {title}
          </p>
          {changedFields.map((field) => {
            const oldValue = entry.oldValues?.[field];
            const newValue = entry.changes?.[field];
            const label = FIELD_LABELS[field] || field;

            return (
              <div
                key={field}
                className={`text-sm flex items-center gap-1.5 flex-wrap ${isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
              >
                <span className="font-medium">{label}:</span>
                {oldValue !== undefined && (
                  <>
                    <span className="opacity-60 line-through">
                      {formatValue(field, oldValue, users, primaryTags, secondaryTags)}
                    </span>
                    <ArrowLeft className="w-3 h-3 opacity-50" />
                  </>
                )}
                <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
                  {formatValue(field, newValue, users, primaryTags, secondaryTags)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Fallback - just show the task title
    return (
      <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
        {config.label} "<span className="font-medium">{title}</span>"
      </p>
    );
  };

  // Apply gray filter for deleted tasks (except the DELETE action itself)
  const shouldShowGrayFilter = isTaskDeleted && entry.action !== "DELETE";

  return (
    <div
      className={`flex items-start gap-3 cursor-pointer transition-all rounded-xl p-2.5 ${isDarkMode
        ? "hover:bg-slate-700/50 active:bg-slate-700"
        : "hover:bg-slate-100 active:bg-slate-200"
        }`}
      style={shouldShowGrayFilter ? { filter: "grayscale(40%)", opacity: 0.7 } : undefined}
      dir="rtl"
      onClick={onClick}
    >
      {/* User Avatar with Action Badge */}
      <div className="relative flex-shrink-0">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={entry.updatedBy}
            className="w-10 h-10 rounded-full object-cover border-2"
            style={{ borderColor: userColor }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: userColor }}
          >
            {entry.updatedBy.charAt(0)}
          </div>
        )}
        {/* Action Badge */}
        <div
          className="absolute -bottom-0.5 -left-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
          style={{
            backgroundColor: config.color,
            border: `2px solid ${isDarkMode ? "#1e293b" : "#ffffff"}`,
          }}
        >
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header: User + Action Type + Time */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-slate-800"
              }`}
          >
            {entry.updatedBy}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
          <span
            className={`text-xs font-bold mr-auto ${isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
          >
            {formatTime(entry.timestamp)}
          </span>
        </div>

        {/* Content based on action type */}
        {renderContent()}
      </div>
    </div>
  );
};
