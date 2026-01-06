/**
 * Activity Feed Storage Utilities
 * 
 * Centralized utility for managing user-specific localStorage keys
 * for the activity feed unread indicators and timestamps.
 * 
 * Keys are prefixed with user ID to support multiple users on the same device.
 */

// Base key prefixes
const STORAGE_PREFIX = "activity_feed";

// Key types
export type ActivityFeedStorageKey =
    | "last_viewed_tasks"
    | "last_viewed_team"
    | "latest_task_update"
    | "latest_team_message";

/**
 * Generate a user-specific storage key
 * @param userId - The user's unique ID
 * @param key - The type of data being stored
 * @returns A user-prefixed storage key
 */
export const getUserStorageKey = (userId: string, key: ActivityFeedStorageKey): string => {
    return `${STORAGE_PREFIX}_${key}_${userId}`;
};

/**
 * Get a timestamp value from user-specific storage
 * @param userId - The user's unique ID
 * @param key - The type of data to retrieve
 * @param defaultValue - Default value if not found (default: 0)
 * @returns The stored timestamp or default value
 */
export const getUserTimestamp = (
    userId: string | undefined,
    key: ActivityFeedStorageKey,
    defaultValue: number = 0
): number => {
    if (!userId) return defaultValue;

    const storageKey = getUserStorageKey(userId, key);
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : defaultValue;
};

/**
 * Set a timestamp value in user-specific storage
 * @param userId - The user's unique ID
 * @param key - The type of data to store
 * @param value - The timestamp value to store
 */
export const setUserTimestamp = (
    userId: string | undefined,
    key: ActivityFeedStorageKey,
    value: number
): void => {
    if (!userId) return;

    const storageKey = getUserStorageKey(userId, key);
    localStorage.setItem(storageKey, value.toString());
};

/**
 * Clear all activity feed storage for a specific user
 * Useful for cleanup on logout if needed
 * @param userId - The user's unique ID
 */
export const clearUserActivityFeedStorage = (userId: string): void => {
    const keys: ActivityFeedStorageKey[] = [
        "last_viewed_tasks",
        "last_viewed_team",
        "latest_task_update",
        "latest_team_message",
    ];

    keys.forEach((key) => {
        const storageKey = getUserStorageKey(userId, key);
        localStorage.removeItem(storageKey);
    });
};
