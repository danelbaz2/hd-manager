import React from "react";
import {
  Plus,
  Pencil,
  Clock,
  CheckCircle2,
  Trash2,
  MessageSquare,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import type { TaskHistoryEntry, TaskHistoryAction } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import { formatTime } from "./activityUtils";

interface ActivityMessageProps {
  entry: TaskHistoryEntry;
  taskTitle?: string;
  isDarkMode: boolean;
  users: UserData[];
  onClick?: () => void;
}

// Action config
const ACTION_CONFIG: Record<
  TaskHistoryAction,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  CREATE: { icon: Plus, color: "#22C55E", bgColor: "#22C55E20", label: "יצירה" },
  UPDATE: { icon: Pencil, color: "#3B82F6", bgColor: "#3B82F620", label: "עדכון" },
  IN_PROGRESS: { icon: Clock, color: "#F59E0B", bgColor: "#F59E0B20", label: "בטיפול" },
  CLOSE: { icon: CheckCircle2, color: "#10B981", bgColor: "#10B98120", label: "נסגר" },
  DELETE: { icon: Trash2, color: "#EF4444", bgColor: "#EF444420", label: "נמחק" },
  NOTE: { icon: MessageSquare, color: "#8B5CF6", bgColor: "#8B5CF620", label: "הערה" },
  ASSIGN: { icon: UserPlus, color: "#06B6D4", bgColor: "#06B6D420", label: "שיוך" },
};

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
};

// Format value for display
const formatValue = (
  field: string,
  value: unknown,
  users: UserData[]
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
    case "responsibleUserIds":
      const ids = value as string[];
      const names = ids
        .map((id) => users.find((u) => u.id === id)?.fullName)
        .filter((n): n is string => !!n);
      return names.length > 0 ? names.join(", ") : "אין אחראים";
    default:
      return String(value);
  }
};

export const ActivityMessage: React.FC<ActivityMessageProps> = ({
  entry,
  taskTitle,
  isDarkMode,
  users,
  onClick,
}) => {
  const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
  const Icon = config.icon;
  const title = taskTitle || "משימה";

  // Find user by fullName
  const user = users.find((u) => u.fullName === entry.updatedBy);
  const userColor = user?.color || "#94a3b8";

  // Get changed fields (excluding base metadata)
  const changedFields = entry.changes
    ? Object.keys(entry.changes).filter((k) =>
      ["title", "description", "priority", "status", "date", "deadline", "responsibleUserIds"].includes(k)
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
                      {formatValue(field, oldValue, users)}
                    </span>
                    <ArrowLeft className="w-3 h-3 opacity-50" />
                  </>
                )}
                <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
                  {formatValue(field, newValue, users)}
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

  return (
    <div
      className={`flex items-start gap-3 cursor-pointer transition-all rounded-xl p-2.5 ${isDarkMode
          ? "hover:bg-slate-700/50 active:bg-slate-700"
          : "hover:bg-slate-100 active:bg-slate-200"
        }`}
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
            className={`text-xs mr-auto ${isDarkMode ? "text-slate-500" : "text-slate-400"
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
