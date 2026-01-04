/**
 * History action configuration constants
 */
import { Plus, Pencil, Clock, CheckCircle2, Trash2, MessageSquare, UserPlus, UserMinus, Calendar, CalendarClock, Flag, Tag, FileText, Type } from "lucide-react";
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
  status: { icon: CheckCircle2, color: "#10B981", bgColor: "#10B98120", label: "סטטוס" },
  title: { icon: Type, color: "#e9d30dff", bgColor: "#e9d30d20", label: "כותרת" },
  description: { icon: FileText, color: "#64748B", bgColor: "#64748B20", label: "תיאור" },
  responsibleUserIds: { icon: UserPlus, color: "#06B6D4", bgColor: "#06B6D420", label: "הקצאת משתמשים" },
  primaryTagIds: { icon: Tag, color: "#6366F1", bgColor: "#6366F120", label: "קטגוריות" },
  secondaryTagIds: { icon: Tag, color: "#6366F1", bgColor: "#6366F120", label: "תגיות" },
};

// Fields that represent data changes (not metadata)
const DATA_FIELDS = [
  "title", "description", "priority", "status", "date", "deadline",
  "responsibleUserIds", "primaryTagIds", "secondaryTagIds",
  // Variants to ensure we catch all backend keys
  "tags", "category", "primary_tags", "secondary_tags", "primary_tag_ids", "secondary_tag_ids"
];

/**
 * Helper to determine if a user change is Add or Remove
 */
const getUserChangeIcon = (entry: TaskHistoryEntry) => {
  const oldIds = (entry.oldValues?.responsibleUserIds as string[] | undefined) || [];
  const newIds = (entry.changes?.responsibleUserIds as string[] | undefined) || [];

  if (newIds.length < oldIds.length) {
    return UserMinus;
  }
  return UserPlus;
};

// Determine which icon config to use based on the entry's changed fields
export const getIconConfig = (entry: TaskHistoryEntry): ActionConfigItem => {
  const baseConfig = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;

  // For UPDATE or ASSIGN actions, check changes to determine the best icon
  // (Backend labels simultaneous changes involving users as 'ASSIGN', so we must check fields there too)
  if ((entry.action === "UPDATE" || entry.action === "ASSIGN") && entry.changes) {
    const changedFields = Object.keys(entry.changes).filter((k) => DATA_FIELDS.includes(k));

    // Strict Rule: If > 1 field changed, use generic pencil icon
    // (This overrides any previous special cases for distinct fields)
    if (changedFields.length > 1) {
      return ACTION_CONFIG.UPDATE;
    }

    // If exactly ONE relevant field changed, try to find a specific icon for it
    if (changedFields.length === 1) {
      const field = changedFields[0];

      // Dynamic icon for users
      if (field === "responsibleUserIds") {
        const userIcon = getUserChangeIcon(entry);
        return { ...FIELD_ICONS.responsibleUserIds, icon: userIcon };
      }

      const fieldIcon = FIELD_ICONS[field];
      if (fieldIcon) {
        return fieldIcon;
      }
    }
  }

  return baseConfig;
};
