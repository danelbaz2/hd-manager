/**
 * Format timestamp to HH:MM format
 */
export const formatTime = (ts: number): string =>
    new Date(ts).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

/**
 * Format timestamp to localized date string
 * Returns "היום" for today, "אתמול" for yesterday, otherwise "DD MMM"
 */
export const formatDate = (ts: number): string => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "היום";
    if (date.toDateString() === yesterday.toDateString()) return "אתמול";
    return date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
};
