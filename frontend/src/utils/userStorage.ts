/**
 * User Storage Utilities
 * 
 * Centralized utility for managing user-specific localStorage data.
 * Uses a single JSON object per user for clean organization.
 * 
 * Storage Structure:
 * {
 *   "hd_manager_<userId>": {
 *     "activityFeed": {
 *       "lastViewedTeam": number,
 *       "lastViewedTasks": number
 *     },
 *     "tour": {
 *       "home": boolean,
 *       "kanban": boolean,
 *       "settings": boolean,
 *       "archive": boolean
 *     },
 *     "onboarding": {
 *       "kanban": boolean
 *     }
 *   }
 * }
 */

// Storage key prefix
const STORAGE_KEY_PREFIX = "hd_manager";

// Type definitions for the storage schema
export interface ActivityFeedData {
    lastViewedTeam: number;
    lastViewedTasks: number;
}

export type TourPageId = "home" | "kanban" | "settings" | "archive";

export interface TourData {
    home: boolean;
    kanban: boolean;
    settings: boolean;
    archive: boolean;
}

export interface OnboardingData {
    kanban: boolean;
}

export interface UserStorageData {
    activityFeed: ActivityFeedData;
    tour: TourData;
    onboarding: OnboardingData;
}

// Default values
const DEFAULT_ACTIVITY_FEED: ActivityFeedData = {
    lastViewedTeam: 0,
    lastViewedTasks: 0,
};

const DEFAULT_TOUR: TourData = {
    home: false,
    kanban: false,
    settings: false,
    archive: false,
};

const DEFAULT_ONBOARDING: OnboardingData = {
    kanban: false,
};

const DEFAULT_USER_DATA: UserStorageData = {
    activityFeed: DEFAULT_ACTIVITY_FEED,
    tour: DEFAULT_TOUR,
    onboarding: DEFAULT_ONBOARDING,
};

/**
 * Generate the storage key for a user
 */
const getUserStorageKey = (userId: string): string => {
    return `${STORAGE_KEY_PREFIX}_${userId}`;
};

/**
 * Get all user data from localStorage
 */
export const getUserData = (userId: string | undefined): UserStorageData => {
    if (!userId) return DEFAULT_USER_DATA;

    try {
        const key = getUserStorageKey(userId);
        const stored = localStorage.getItem(key);
        if (!stored) return DEFAULT_USER_DATA;

        const parsed = JSON.parse(stored) as Partial<UserStorageData>;
        
        // Merge with defaults to ensure all fields exist
        return {
            activityFeed: { ...DEFAULT_ACTIVITY_FEED, ...parsed.activityFeed },
            tour: { ...DEFAULT_TOUR, ...parsed.tour },
            onboarding: { ...DEFAULT_ONBOARDING, ...parsed.onboarding },
        };
    } catch (error) {
        console.error("Error reading user storage:", error);
        return DEFAULT_USER_DATA;
    }
};

/**
 * Save all user data to localStorage
 */
export const setUserData = (userId: string | undefined, data: UserStorageData): void => {
    if (!userId) return;

    try {
        const key = getUserStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving user storage:", error);
    }
};

/**
 * Update specific fields in user data (partial update)
 */
export const updateUserData = (
    userId: string | undefined,
    updates: Partial<UserStorageData>
): void => {
    if (!userId) return;

    const currentData = getUserData(userId);
    const newData: UserStorageData = {
        activityFeed: updates.activityFeed 
            ? { ...currentData.activityFeed, ...updates.activityFeed }
            : currentData.activityFeed,
        tour: updates.tour
            ? { ...currentData.tour, ...updates.tour }
            : currentData.tour,
        onboarding: updates.onboarding
            ? { ...currentData.onboarding, ...updates.onboarding }
            : currentData.onboarding,
    };
    setUserData(userId, newData);
};

// ==================== Activity Feed Helpers ====================

/**
 * Get activity feed data for a user
 */
export const getActivityFeedData = (userId: string | undefined): ActivityFeedData => {
    return getUserData(userId).activityFeed;
};

/**
 * Update activity feed data
 */
export const setActivityFeedData = (
    userId: string | undefined,
    data: Partial<ActivityFeedData>
): void => {
    updateUserData(userId, { activityFeed: data as ActivityFeedData });
};

/**
 * Get a specific activity feed timestamp
 */
export const getActivityFeedTimestamp = (
    userId: string | undefined,
    key: keyof ActivityFeedData
): number => {
    return getActivityFeedData(userId)[key];
};

/**
 * Set a specific activity feed timestamp
 */
export const setActivityFeedTimestamp = (
    userId: string | undefined,
    key: keyof ActivityFeedData,
    value: number
): void => {
    const currentData = getUserData(userId);
    const newActivityFeed = { ...currentData.activityFeed, [key]: value };
    setUserData(userId, { ...currentData, activityFeed: newActivityFeed });
};

/**
 * Clear only activity feed data (preserves tour and onboarding progress)
 * Used on logout to reset unread indicators without losing tour progress
 */
export const clearActivityFeedData = (userId: string | undefined): void => {
    if (!userId) return;
    updateUserData(userId, { activityFeed: DEFAULT_ACTIVITY_FEED });
};

// ==================== Tour Helpers ====================

/**
 * Get tour data for a user
 */
export const getTourData = (userId: string | undefined): TourData => {
    return getUserData(userId).tour;
};

/**
 * Check if a user has seen a specific tour
 */
export const hasSeenTour = (userId: string | undefined, pageId: TourPageId): boolean => {
    return getTourData(userId)[pageId];
};

/**
 * Mark a tour as seen/completed
 */
export const markTourSeen = (userId: string | undefined, pageId: TourPageId): void => {
    const currentData = getUserData(userId);
    const newTour = { ...currentData.tour, [pageId]: true };
    setUserData(userId, { ...currentData, tour: newTour });
};

/**
 * Reset a specific tour (for testing/debugging)
 */
export const resetTour = (userId: string | undefined, pageId: TourPageId): void => {
    const currentData = getUserData(userId);
    const newTour = { ...currentData.tour, [pageId]: false };
    setUserData(userId, { ...currentData, tour: newTour });
};

/**
 * Reset all tours for a user
 */
export const resetAllTours = (userId: string | undefined): void => {
    updateUserData(userId, { tour: DEFAULT_TOUR });
};

// ==================== Onboarding Helpers ====================

/**
 * Check if kanban onboarding has been completed
 */
export const hasCompletedKanbanOnboarding = (userId: string | undefined): boolean => {
    return getUserData(userId).onboarding.kanban;
};

/**
 * Mark kanban onboarding as completed
 */
export const markKanbanOnboardingComplete = (userId: string | undefined): void => {
    const currentData = getUserData(userId);
    const newOnboarding = { ...currentData.onboarding, kanban: true };
    setUserData(userId, { ...currentData, onboarding: newOnboarding });
};

/**
 * Reset kanban onboarding (for testing/debugging)
 */
export const resetKanbanOnboarding = (userId: string | undefined): void => {
    const currentData = getUserData(userId);
    const newOnboarding = { ...currentData.onboarding, kanban: false };
    setUserData(userId, { ...currentData, onboarding: newOnboarding });
};

// ==================== Cleanup ====================

/**
 * Clear all stored data for a user
 */
export const clearUserData = (userId: string | undefined): void => {
    if (!userId) return;
    
    try {
        const key = getUserStorageKey(userId);
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error clearing user storage:", error);
    }
};

/**
 * Migrate data from old storage format to new format
 * Call this once on app startup to migrate existing users
 */
export const migrateOldStorage = (userId: string | undefined): void => {
    if (!userId) return;

    // Check if already migrated (new format exists)
    const key = getUserStorageKey(userId);
    if (localStorage.getItem(key)) return;

    // Migration from old format
    const oldActivityFeedPrefix = "activity_feed_";
    const oldTourPrefix = "hd_tour_";

    const activityFeed: ActivityFeedData = {
        lastViewedTeam: parseInt(localStorage.getItem(`${oldActivityFeedPrefix}last_viewed_team_${userId}`) || "0", 10),
        lastViewedTasks: parseInt(localStorage.getItem(`${oldActivityFeedPrefix}last_viewed_tasks_${userId}`) || "0", 10),
    };

    const tour: TourData = {
        home: localStorage.getItem(`${oldTourPrefix}home_${userId}`) === "true",
        kanban: localStorage.getItem(`${oldTourPrefix}kanban_${userId}`) === "true",
        settings: localStorage.getItem(`${oldTourPrefix}settings_${userId}`) === "true",
        archive: localStorage.getItem(`${oldTourPrefix}archive_${userId}`) === "true",
    };

    // Also migrate the old kanban_onboarding_completed key
    const onboarding: OnboardingData = {
        kanban: localStorage.getItem("kanban_onboarding_completed") === "true",
    };

    // Only migrate if there's actual data
    const hasOldData = 
        activityFeed.lastViewedTeam > 0 || 
        activityFeed.lastViewedTasks > 0 ||
        tour.home || tour.kanban || tour.settings || tour.archive ||
        onboarding.kanban;

    if (hasOldData) {
        setUserData(userId, { activityFeed, tour, onboarding });
        
        // Clean up old keys
        localStorage.removeItem(`${oldActivityFeedPrefix}last_viewed_team_${userId}`);
        localStorage.removeItem(`${oldActivityFeedPrefix}last_viewed_tasks_${userId}`);
        localStorage.removeItem(`${oldActivityFeedPrefix}latest_task_update_${userId}`);
        localStorage.removeItem(`${oldActivityFeedPrefix}latest_team_message_${userId}`);
        localStorage.removeItem(`${oldTourPrefix}home_${userId}`);
        localStorage.removeItem(`${oldTourPrefix}kanban_${userId}`);
        localStorage.removeItem(`${oldTourPrefix}settings_${userId}`);
        localStorage.removeItem(`${oldTourPrefix}archive_${userId}`);
        localStorage.removeItem("kanban_onboarding_completed");
        
        console.log("Migrated user storage to new format for user:", userId);
    }
};
