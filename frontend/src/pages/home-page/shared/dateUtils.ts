// Date utility functions for filtering tasks
import { type Task } from "../../../api/tasksApi";

export type ViewMode = "daily" | "weekly" | "monthly";

// Get week start date (Sunday) for a given date
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get week end date (Saturday) for a given date
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

// Get month start date
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get month end date
export const getMonthEnd = (date: Date): Date => {
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);
  return monthEnd;
};

// Filter tasks by date range based on view mode
export const filterTasksByDateRange = (
  tasks: Task[],
  selectedDate: number,
  viewMode: ViewMode
): Task[] => {
  const date = new Date(selectedDate);

  if (viewMode === "daily") {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return taskDate >= start && taskDate <= end;
    });
  }

  if (viewMode === "weekly") {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);

    return tasks.filter((task) => {
      const taskStart = new Date(task.date || 0);
      const taskEnd = task.deadline
        ? new Date(task.deadline)
        : new Date(taskStart);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(23, 59, 59, 999);
      return taskStart <= weekEnd && taskEnd >= weekStart;
    });
  }

  // Monthly
  const monthStart = getMonthStart(date);
  const monthEnd = getMonthEnd(date);

  return tasks.filter((task) => {
    if (!task.date) return false;
    const taskDate = new Date(task.date);
    return taskDate >= monthStart && taskDate <= monthEnd;
  });
};

// Filter tasks by search query
export const filterTasksBySearch = (
  tasks: Task[],
  query: string
): Task[] => {
  if (!query.trim()) return tasks;
  const lowerQuery = query.toLowerCase();
  return tasks.filter((task) =>
    task.title?.toLowerCase().includes(lowerQuery) ||
    task.description?.toLowerCase().includes(lowerQuery)
  );
};

// Filter tasks by status
export const filterTasksByStatus = (
  tasks: Task[],
  statuses: string[]
): Task[] => {
  if (statuses.length === 0) return tasks;
  return tasks.filter((task) => task.status && statuses.includes(task.status));
};

// Filter tasks by tags
export const filterTasksByTags = (
  tasks: Task[],
  tagIds: string[]
): Task[] => {
  if (tagIds.length === 0) return tasks;
  return tasks.filter((task) =>
    task.secondaryTagIds?.some((tagId) => tagIds.includes(tagId))
  );
};
