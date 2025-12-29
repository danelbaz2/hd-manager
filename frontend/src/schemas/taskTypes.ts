// Task types and constants

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: number; // Timestamp for start date
  deadline?: number; // Timestamp for deadline
  responsibleUserIds: string[];
  primaryTagIds: string[];  // Primary Tag IDs (categories)
  secondaryTagIds: string[];  // Secondary Tag IDs (new two-tier tag system)
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
  responsibleUserIds: string[];
  primaryTagIds: string[];  // Primary Tag IDs (categories)
  secondaryTagIds: string[];  // Secondary Tag IDs (new two-tier tag system)
}

// Priority options with Hebrew labels
export const PRIORITY_OPTIONS: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "נמוכה" },
  { id: "medium", label: "בינונית" },
  { id: "high", label: "גבוהה" },
];

// Status options with Hebrew labels
export const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: "pending", label: "פתוח" },
  { id: "in_progress", label: "בטיפול" },
  { id: "completed", label: "סגור" },
];

// Priority colors for visual representation
export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: "#86EFAC", text: "#166534" }, // Green
  medium: { bg: "#FCD34D", text: "#92400E" }, // Amber
  high: { bg: "#FDA4AF", text: "#9F1239" }, // Rose
};

// Status colors for visual representation (matches Kanban column colors)
export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  pending: { bg: "#D1FAE5", text: "#059669" }, // Emerald (green)
  in_progress: { bg: "#FEF3C7", text: "#D97706" }, // Amber (orange)
  completed: { bg: "#E2E8F0", text: "#64748B" }, // Slate (gray)
};

// Default form data for creating new tasks
export const DEFAULT_TASK_FORM: TaskFormData = {
  id: null,
  title: "",
  description: "",
  priority: "medium",
  date: Date.now(),
  deadline: undefined,
  responsibleUserIds: [],
  primaryTagIds: [],
  secondaryTagIds: [],
};
