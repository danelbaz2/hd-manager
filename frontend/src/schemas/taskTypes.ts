// Task types and constants

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: number; // Timestamp for start date
  deadline?: number; // Timestamp for deadline
  responsibleUsersId: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TaskFormData {
  id?: string | null; // Optional - only present when editing
  title: string;
  description?: string;
  priority: TaskPriority;
  date: number; // Timestamp for start date
  deadline?: number; // Timestamp for deadline
  responsibleUsersId: string[];
  tags: string[];
}

// Priority options with Hebrew labels
export const PRIORITY_OPTIONS: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "נמוכה" },
  { id: "medium", label: "בינונית" },
  { id: "high", label: "גבוהה" },
];

// Status options with Hebrew labels
export const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: "pending", label: "ממתין" },
  { id: "in_progress", label: "בביצוע" },
  { id: "completed", label: "הושלם" },
  { id: "cancelled", label: "בוטל" },
];

// Priority colors for visual representation
export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: "#86EFAC", text: "#166534" }, // Green
  medium: { bg: "#FCD34D", text: "#92400E" }, // Amber
  high: { bg: "#FDA4AF", text: "#9F1239" }, // Rose
};

// Status colors for visual representation
export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  pending: { bg: "#E2E8F0", text: "#475569" }, // Slate
  in_progress: { bg: "#93C5FD", text: "#1E40AF" }, // Blue
  completed: { bg: "#86EFAC", text: "#166534" }, // Green
  cancelled: { bg: "#FDA4AF", text: "#9F1239" }, // Rose
};

// Default form data for creating new tasks
export const DEFAULT_TASK_FORM: TaskFormData = {
  id: null,
  title: "",
  description: "",
  priority: "medium",
  date: Date.now(),
  deadline: undefined,
  responsibleUsersId: [],
  tags: [],
};
