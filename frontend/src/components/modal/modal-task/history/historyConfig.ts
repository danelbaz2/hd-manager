import { Plus, Pencil, Clock, CheckCircle2, Trash2, MessageSquare, UserPlus, UserMinus, Calendar, CalendarClock, Flag, Tag, FileText, Type, Circle, ShieldCheck, XCircle } from "lucide-react";
import type { TaskHistoryAction, TaskHistoryEntry } from "../../../../api/tasksApi";

export interface ActionConfigItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Base configuration for high-level task actions
 */
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
  PENDING_APPROVAL: {
    icon: ShieldCheck,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "נשלח לאישור סגירה",
  },
  APPROVE: {
    icon: CheckCircle2,
    color: "#10B981",
    bgColor: "#10B98120",
    label: "אושר וסגור",
  },
  REJECT: {
    icon: XCircle,
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "נדחה והוחזר לטיפול",
  },
};

/**
 * Status-specific styling for history entries
 */
const STATUS_STYLES: Record<string, Partial<ActionConfigItem>> = {
  pending: {
    icon: Circle,
    color: "#0EA5E9", // Sky Blue for "Open"
    bgColor: "#0EA5E920",
  },
  in_progress: {
    icon: Clock,
    color: "#F59E0B", // Amber for "In Progress"
    bgColor: "#F59E0B20",
  },
  pending_approval: {
    icon: ShieldCheck,
    color: "#8B5CF6", // Purple for "Pending Approval"
    bgColor: "#8B5CF620",
  },
  completed: {
    icon: CheckCircle2,
    color: "#10B981", // Emerald for "Completed"
    bgColor: "#10B98120",
  },
};

/**
 * Field-specific icons and colors for single-field updates
 */
export const FIELD_ICONS: Record<string, ActionConfigItem> = {
  date: { icon: Calendar, color: "#f99e16ff", bgColor: "#F9731620", label: "תאריך" },
  deadline: { icon: CalendarClock, color: "#F97316", bgColor: "#F9731620", label: "תאריך יעד" },
  priority: { icon: Flag, color: "#EC4899", bgColor: "#EC489920", label: "עדיפות" },
  status: { icon: CheckCircle2, color: "#10B981", bgColor: "#10B98120", label: "סטטוס" }, // Default status config
  title: { icon: Type, color: "#A27B5C", bgColor: "#A27B5C20", label: "כותרת" },
  description: { icon: FileText, color: "#64748B", bgColor: "#64748B20", label: "תיאור" },
  responsibleUserIds: { icon: UserPlus, color: "#06B6D4", bgColor: "#06B6D420", label: "הקצאת משתמשים" },
  primaryTagIds: { icon: Tag, color: "#6366F1", bgColor: "#6366F120", label: "קטגוריות" },
  secondaryTagIds: { icon: Tag, color: "#6366F1", bgColor: "#6366F120", label: "תגיות" },
};

// Fields that represent data changes (not metadata)
const DATA_FIELDS = [
  "title", "description", "priority", "status", "date", "deadline",
  "responsibleUserIds", "primaryTagIds", "secondaryTagIds",
  "tags", "category", "primary_tags", "secondary_tags", "primary_tag_ids", "secondary_tag_ids"
];

/**
 * Helper to determine if a user change is Add or Remove
 */
const getUserChangeIcon = (entry: TaskHistoryEntry): typeof UserPlus => {
  const oldIds = (entry.oldValues?.responsibleUserIds as string[] | undefined) || [];
  const newIds = (entry.changes?.responsibleUserIds as string[] | undefined) || [];
  return newIds.length < oldIds.length ? UserMinus : UserPlus;
};

/**
 * Determine which icon config to use based on the entry's changed fields
 */
export const getIconConfig = (entry: TaskHistoryEntry): ActionConfigItem => {
  const baseConfig = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;

  if ((entry.action === "UPDATE" || entry.action === "ASSIGN") && entry.changes) {
    const changedFields = Object.keys(entry.changes).filter((k) => DATA_FIELDS.includes(k));

    // Multi-field update: show Pencil
    if (changedFields.length > 1) {
      return ACTION_CONFIG.UPDATE;
    }

    // Single-field update: show specific icon
    if (changedFields.length === 1) {
      const field = changedFields[0];

      // Assignment: Plus/Minus
      if (field === "responsibleUserIds") {
        return { ...FIELD_ICONS.responsibleUserIds, icon: getUserChangeIcon(entry) };
      }

      // Status: Sky Blue (Pending) / Amber (In Progress) / Emerald (Completed)
      if (field === "status") {
        const newStatus = entry.changes.status as string;
        const statusStyle = STATUS_STYLES[newStatus] || FIELD_ICONS.status;
        return { ...FIELD_ICONS.status, ...statusStyle };
      }

      const fieldIcon = FIELD_ICONS[field];
      if (fieldIcon) return fieldIcon;
    }
  }

  return baseConfig;
};
