import type { Task, TaskOptionals } from "../../../../api/tasksApi";
import type { TaskPriority } from "../../../../schemas/taskTypes";

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
 * Compare optional fields equality
 */
export const isOptionalsEqual = (a: TaskOptionals | undefined, b: TaskOptionals | undefined): boolean => {
  if (!a && !b) return true;
  if (!a || !b) {
    // Treat empty object same as undefined/none
    const aEmpty = !a || Object.values(a).every(v => !v);
    const bEmpty = !b || Object.values(b).every(v => !v);
    return aEmpty === bEmpty;
  }
  return (
    (a.pikud || "") === (b.pikud || "") &&
    (a.ugda || "") === (b.ugda || "") &&
    (a.hativa || "") === (b.hativa || "") &&
    (a.gdud || "") === (b.gdud || "") &&
    (a.externalSystem || "") === (b.externalSystem || "") &&
    (a.externalId || "") === (b.externalId || "")
  );
};

/**
 * Get only the changed optional fields (returns undefined if no changes)
 */
export const getChangedOptionals = (
  newOptionals: TaskOptionals,
  originalOptionals: TaskOptionals | undefined
): TaskOptionals | undefined => {
  const original = originalOptionals || {};
  const changed: TaskOptionals = {};
  let hasChanges = false;

  const fields: (keyof TaskOptionals)[] = ['pikud', 'ugda', 'hativa', 'gdud', 'externalSystem', 'externalId'];

  for (const field of fields) {
    const newVal = newOptionals[field] || "";
    const oldVal = original[field] || "";
    if (newVal !== oldVal) {
      changed[field] = newVal;
      hasChanges = true;
    }
  }

  return hasChanges ? changed : undefined;
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
  optionals: task.optionals || {},
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
  selectedSecondaryTagIds: string[],
  optionals: TaskOptionals
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
    !arraysEqual(selectedSecondaryTagIds, task.secondaryTagIds || []) ||
    !isOptionalsEqual(optionals, task.optionals)
  );
};
