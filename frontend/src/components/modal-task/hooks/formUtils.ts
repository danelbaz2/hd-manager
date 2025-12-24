import type { Task } from "../../../api/tasksApi";
import type { TaskPriority } from "../../../schemas/taskTypes";

/**
 * Parse date string to timestamp at noon local time
 */
export const parseDateToTimestamp = (dateStr: string): number => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
};

/**
 * Convert timestamp to date string (YYYY-MM-DD format)
 */
export const timestampToDateStr = (ts: number | undefined): string =>
  ts ? new Date(ts).toISOString().split("T")[0] : "";

/**
 * Compare two arrays for equality (order-insensitive)
 */
export const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
};

/**
 * Initialize form state from task
 */
export const initFormFromTask = (task: Task) => ({
  title: task.title || "",
  description: task.description || "",
  priority: (task.priority as TaskPriority) || "medium",
  selectedSecondaryTagIds: task.secondaryTagIds || [],
  selectedPrimaryTagIds: task.primaryTagIds || [],
  selectedUserIds: task.responsibleUserIds || [],
  startDate: task.date ? timestampToDateStr(task.date) : "",
  deadline: task.deadline ? timestampToDateStr(task.deadline) : "",
});

/**
 * Check if form has changes compared to original task
 */
export const hasFormChanges = (
  task: Task,
  title: string,
  description: string,
  priority: TaskPriority,
  startDate: string,
  deadline: string,
  selectedUserIds: string[],
  selectedPrimaryTagIds: string[],
  selectedSecondaryTagIds: string[]
): boolean => {
  const originalStartDate = timestampToDateStr(task.date);
  const originalDeadline = timestampToDateStr(task.deadline);

  return (
    title.trim() !== (task.title || "") ||
    (description.trim() || "") !== (task.description || "") ||
    priority !== (task.priority || "medium") ||
    startDate !== originalStartDate ||
    deadline !== originalDeadline ||
    !arraysEqual(selectedUserIds, task.responsibleUserIds || []) ||
    !arraysEqual(selectedPrimaryTagIds, task.primaryTagIds || []) ||
    !arraysEqual(selectedSecondaryTagIds, task.secondaryTagIds || [])
  );
};
