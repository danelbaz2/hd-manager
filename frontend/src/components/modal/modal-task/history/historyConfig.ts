/**
 * History action configuration constants
 */
import { Plus, Pencil, Clock, CheckCircle2, Trash2, MessageSquare, UserPlus } from "lucide-react";
import type { TaskHistoryAction } from "../../../../api/tasksApi";

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
    label: "יצר את המשימה",
  },
  UPDATE: {
    icon: Pencil,
    color: "#3B82F6",
    bgColor: "#3B82F620",
    label: "עדכן את המשימה",
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
    label: "סגר את המשימה",
  },
  DELETE: {
    icon: Trash2,
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "מחק את המשימה",
  },
  NOTE: {
    icon: MessageSquare,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "הוסיף הערה",
  },
  ASSIGN: {
    icon: UserPlus,
    color: "#06B6D4",
    bgColor: "#06B6D420",
    label: "המשימה שויכה",
  },
};
