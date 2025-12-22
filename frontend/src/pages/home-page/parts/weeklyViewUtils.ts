import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";

/**
 * Shared utility functions for weekly view components
 */

export const HEBREW_DAYS_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

/**
 * Get user by ID from users array
 */
export const getUserById = (userId: string, users: UserData[]): UserData | undefined => {
  return users.find((u) => u.id === userId);
};

/**
 * Get status color class for weekly view task bar
 */
export const getWeeklyStatusColor = (status?: string): string => {
  switch (status) {
    case "pending":
      return "bg-emerald-500";
    case "in_progress":
      return "bg-amber-500";
    case "completed":
      return "bg-slate-400";
    case "cancelled":
      return "bg-red-400";
    default:
      return "bg-slate-400";
  }
};

export interface ProcessedTask extends Task {
  colStart: number;
  colSpan: number;
  visualRow: number;
}

/**
 * Calculate grid position for a task in weekly view
 */
export const getGridPosition = (
  task: Task,
  startWindow: Date,
  endWindow: Date
): { colStart: number; colSpan: number } => {
  const taskStart = new Date(task.date || 0);
  const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart);

  taskStart.setHours(0, 0, 0, 0);
  taskEnd.setHours(0, 0, 0, 0);

  // Visual Start: If task starts before window, clip it
  const visualStart = taskStart < startWindow ? new Date(startWindow) : new Date(taskStart);

  // Visual End: If task ends after window, clip it
  const endWindowMidnight = new Date(endWindow);
  endWindowMidnight.setHours(0, 0, 0, 0);
  const visualEnd = taskEnd > endWindowMidnight ? endWindowMidnight : new Date(taskEnd);

  // Calculate column start (1-based)
  const diffTime = visualStart.getTime() - startWindow.getTime();
  const startOffset = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Calculate duration in days
  const durationTime = visualEnd.getTime() - visualStart.getTime();
  const durationDays = Math.floor(durationTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    colStart: startOffset + 1,
    colSpan: Math.max(1, durationDays),
  };
};

/**
 * Assign visual rows to tasks to prevent overlap
 */
export const assignVisualRows = (tasks: ProcessedTask[]): ProcessedTask[] => {
  const sortedTasks = [...tasks].sort((a, b) => a.colStart - b.colStart);
  const rows: ProcessedTask[][] = [];

  sortedTasks.forEach((task) => {
    let rowIndex = 0;
    while (true) {
      const isOccupied = rows[rowIndex]?.some((t) => {
        const tEnd = t.colStart + t.colSpan;
        const taskEnd = task.colStart + task.colSpan;
        return task.colStart < tEnd && taskEnd > t.colStart;
      });

      if (!isOccupied) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push(task);
        task.visualRow = rowIndex;
        break;
      }
      rowIndex++;
    }
  });

  return sortedTasks;
};

/**
 * Generate week days array from start date
 */
export const generateWeekDays = (startWindow: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startWindow);
    d.setDate(startWindow.getDate() + i);
    return d;
  });
};

/**
 * Filter tasks that overlap with the week window
 */
export const filterWeekTasks = (
  tasks: Task[],
  startWindow: Date,
  endWindow: Date
): Task[] => {
  return tasks.filter((task) => {
    const taskStart = new Date(task.date || 0);
    const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart);

    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(23, 59, 59, 999);

    return taskStart <= endWindow && taskEnd >= startWindow;
  });
};
