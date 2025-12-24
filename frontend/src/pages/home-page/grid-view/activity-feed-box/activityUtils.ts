// Activity Feed utility functions
import type { TaskHistoryEntry, TaskHistoryAction } from "../../../../api/tasksApi";

/**
 * Check if a timestamp falls on the same day as the selected date
 */
export const isSameDay = (timestamp: number, selectedDate: number): boolean => {
    const date1 = new Date(timestamp);
    const date2 = new Date(selectedDate);
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * Format timestamp to time string (HH:MM)
 */
export const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Get action label in Hebrew
 */
export const getActionLabel = (action: TaskHistoryAction): string => {
    const labels: Record<TaskHistoryAction, string> = {
        CREATE: "יצר משימה",
        UPDATE: "עדכן משימה",
        IN_PROGRESS: "התחיל לטפל ב",
        CLOSE: "סגר את",
        DELETE: "מחק משימה",
        NOTE: "הוסיף הערה ל",
        ASSIGN: "שייך משימה",
    };
    return labels[action] || "עדכון";
};

/**
 * Get action color based on type
 */
export const getActionColor = (
    action: TaskHistoryAction,
    isDarkMode: boolean
): string => {
    const colors: Record<TaskHistoryAction, { dark: string; light: string }> = {
        CREATE: { dark: "text-green-400", light: "text-green-600" },
        UPDATE: { dark: "text-blue-400", light: "text-blue-600" },
        IN_PROGRESS: { dark: "text-yellow-400", light: "text-yellow-600" },
        CLOSE: { dark: "text-emerald-400", light: "text-emerald-600" },
        DELETE: { dark: "text-red-400", light: "text-red-600" },
        NOTE: { dark: "text-purple-400", light: "text-purple-600" },
        ASSIGN: { dark: "text-cyan-400", light: "text-cyan-600" },
    };
    return colors[action]?.[isDarkMode ? "dark" : "light"] || "text-slate-500";
};

/**
 * Build display message for an activity entry
 */
export const buildActivityMessage = (
    entry: TaskHistoryEntry,
    taskTitle?: string
): string => {
    const actionLabel = getActionLabel(entry.action);
    const title = taskTitle || "משימה";

    if (entry.action === "NOTE" && entry.note) {
        return `${actionLabel} "${title}": ${entry.note}`;
    }

    if (entry.action === "UPDATE" && entry.changes) {
        const changeKeys = Object.keys(entry.changes);
        if (changeKeys.includes("status")) {
            return `שינה סטטוס של "${title}"`;
        }
        if (changeKeys.includes("priority")) {
            return `שינה עדיפות של "${title}"`;
        }
        if (changeKeys.includes("deadline")) {
            return `עדכן תאריך יעד של "${title}"`;
        }
    }

    return `${actionLabel} "${title}"`;
};

/**
 * Filter activities by selected date
 */
export const filterActivitiesByDate = (
    activities: TaskHistoryEntry[],
    selectedDate: number
): TaskHistoryEntry[] => {
    return activities.filter((entry) => isSameDay(entry.timestamp, selectedDate));
};

/**
 * Sort activities by timestamp (oldest first - earliest at top)
 */
export const sortActivitiesByTime = (
    activities: TaskHistoryEntry[]
): TaskHistoryEntry[] => {
    return [...activities].sort((a, b) => a.timestamp - b.timestamp);
};
