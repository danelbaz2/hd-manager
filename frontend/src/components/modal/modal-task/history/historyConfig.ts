/**
 * History action configuration constants
 */
import { Plus, Pencil, Clock, CheckCircle2, Trash2, MessageSquare, UserPlus, Calendar, CalendarClock, Flag, Tag } from "lucide-react";
import type { TaskHistoryAction, TaskHistoryEntry } from "../../../../api/tasksApi";

export interface ActionConfigItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  label: string;
}

export const ACTION_CONFIG: Record<TaskHistoryAction, ActionConfigItem> = {
  CREATE: {
    icon: Plus,
    color: "#22C55E",
    bgColor: "#22C55E20",
    label: "יצירת משימה",
  },
  UPDATE: {
    icon: Pencil,
    color: "#3B82F6",
    bgColor: "#3B82F620",
    label: "עדכון משימה",
  },
  IN_PROGRESS: {
    icon: Clock,
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    label: "המשימה הועברה לטיפול",
  },
  CLOSE: {
    icon: CheckCircle2,
    color: "#10B981",
    bgColor: "#10B98120",
    label: "סגירת משימה",
  },
  DELETE: {
    icon: Trash2,
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "מחיקת משימה",
  },
  NOTE: {
    icon: MessageSquare,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "הוספת הערה",
  },
  ASSIGN: {
    icon: UserPlus,
    color: "#06B6D4",
    bgColor: "#06B6D420",
    label: "שינוי הקצאה",
  },
};

// Field-specific icons for UPDATE actions
export const FIELD_ICONS: Record<string, ActionConfigItem> = {
  date: { icon: Calendar, color: "#3B82F6", bgColor: "#3B82F620", label: "תאריך" },
  deadline: { icon: CalendarClock, color: "#F97316", bgColor: "#F9731620", label: "תאריך יעד" },
  priority: { icon: Flag, color: "#EC4899", bgColor: "#EC489920", label: "עדיפות" },
  primaryTagIds: { icon: Tag, color: "#8B5CF6", bgColor: "#8B5CF620", label: "קטגוריות" },
  secondaryTagIds: { icon: Tag, color: "#8B5CF6", bgColor: "#8B5CF620", label: "תגיות" },
};

// Fields that represent data changes (not metadata)
const DATA_FIELDS = ["title", "description", "priority", "status", "date", "deadline", "responsibleUserIds", "primaryTagIds", "secondaryTagIds"];

// Determine which icon config to use based on the entry's changed fields
export const getIconConfig = (entry: TaskHistoryEntry): ActionConfigItem => {
  const baseConfig = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;

  // For UPDATE actions, check if a single specific field was changed
  if (entry.action === "UPDATE" && entry.changes) {
    const changedFields = Object.keys(entry.changes).filter((k) => DATA_FIELDS.includes(k));

    // If only one field changed and it has a specific icon, use that
    if (changedFields.length === 1) {
      const fieldIcon = FIELD_ICONS[changedFields[0]];
      if (fieldIcon) {
        return fieldIcon;
      }
    }
  }

  return baseConfig;
};
