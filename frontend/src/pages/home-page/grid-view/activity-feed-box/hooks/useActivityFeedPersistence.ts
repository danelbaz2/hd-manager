import { useState, useCallback, useEffect, useRef } from "react";
import { getUserTimestamp, setUserTimestamp } from "../../../../../utils/activityFeedStorage";

type TabType = "tasks" | "team";

interface UseActivityFeedPersistenceProps {
    userId: string | undefined;
    latestTaskTime: number;
    latestTeamTime: number;
}

interface UseActivityFeedPersistenceReturn {
    activeTab: TabType;
    lastViewedTasks: number;
    lastViewedTeam: number;
    highlightTasksTime: number;
    highlightTeamTime: number;
    hasUnreadTasks: boolean;
    hasUnreadTeam: boolean;
    handleTabChange: (tab: TabType) => void;
}

// Delay before marking items as "viewed" after switching tabs
// This gives users time to see the highlighting effect
const VIEW_DELAY_MS = 1500;

/**
 * Custom hook to manage activity feed tab state and persistence logic
 * - Uses user-specific localStorage keys for multi-user support
 * - Manages localStorage for last viewed timestamps
 * - Handles tab switching and highlight snapshots
 * - Calculates unread indicators
 * - Reads global latest task/team message timestamps for cross-page notifications
 */
export const useActivityFeedPersistence = ({
    userId,
    latestTaskTime,
    latestTeamTime,
}: UseActivityFeedPersistenceProps): UseActivityFeedPersistenceReturn => {
    // Active tab state
    const [activeTab, setActiveTab] = useState<TabType>("tasks");

    // Track if component has mounted and initial highlight has been shown
    const hasMountedRef = useRef(false);
    const [initialHighlightDone, setInitialHighlightDone] = useState(false);

    // Persistent storage for "last viewed" timestamps (user-specific)
    const [lastViewedTasks, setLastViewedTasks] = useState<number>(() => {
        return getUserTimestamp(userId, "last_viewed_tasks", 0);
    });

    const [lastViewedTeam, setLastViewedTeam] = useState<number>(() => {
        return getUserTimestamp(userId, "last_viewed_team", 0);
    });

    // Re-initialize when userId changes (e.g., after login)
    useEffect(() => {
        if (userId) {
            setLastViewedTasks(getUserTimestamp(userId, "last_viewed_tasks", 0));
            setLastViewedTeam(getUserTimestamp(userId, "last_viewed_team", 0));
        }
    }, [userId]);

    // Snapshot timestamps for highlighting "new" items when viewing
    const [highlightTasksTime, setHighlightTasksTime] = useState<number>(lastViewedTasks);
    const [highlightTeamTime, setHighlightTeamTime] = useState<number>(lastViewedTeam);

    // Read the global latest task update timestamp from user-specific storage
    // This is set by TasksContext when WebSocket updates arrive (even when not on home page)
    const globalLatestTaskTime = getUserTimestamp(userId, "latest_task_update", 0);

    // Read the global latest team message timestamp from user-specific storage
    // This is set by ChatContext when WebSocket messages arrive (even when not on home page)
    const globalLatestTeamTime = getUserTimestamp(userId, "latest_team_message", 0);

    // Use the maximum of prop time and global timestamp
    // This ensures we catch updates that arrived while on another page
    const effectiveLatestTaskTime = Math.max(latestTaskTime, globalLatestTaskTime);
    const effectiveLatestTeamTime = Math.max(latestTeamTime, globalLatestTeamTime);

    // Derived unread state (Show dot if new data > last viewed AND tab not active)
    const hasUnreadTasks = activeTab !== "tasks" && effectiveLatestTaskTime > lastViewedTasks;
    const hasUnreadTeam = activeTab !== "team" && effectiveLatestTeamTime > lastViewedTeam;

    // Handle initial mount - delay marking as viewed so user sees highlighting
    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;

            // Set highlight time for initial load - this is what items will be compared against
            // for the "NEW" highlighting effect
            setHighlightTasksTime(lastViewedTasks);
            setHighlightTeamTime(lastViewedTeam);

            // Delay marking items as "viewed" to give user time to see highlights
            const timer = setTimeout(() => {
                setInitialHighlightDone(true);

                // Only update if tasks tab is active (default)
                if (activeTab === "tasks" && effectiveLatestTaskTime > lastViewedTasks) {
                    const now = Date.now();
                    const newTime = Math.max(effectiveLatestTaskTime, now);
                    setLastViewedTasks(newTime);
                    setUserTimestamp(userId, "last_viewed_tasks", newTime);
                }
            }, VIEW_DELAY_MS);

            return () => clearTimeout(timer);
        }
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-update "last viewed" while staying on the active tab (after initial delay)
    useEffect(() => {
        // Skip if initial highlight period hasn't passed
        if (!initialHighlightDone) return;

        if (activeTab === "tasks") {
            if (effectiveLatestTaskTime > lastViewedTasks) {
                const now = Date.now();
                const newTime = Math.max(effectiveLatestTaskTime, now);
                setLastViewedTasks(newTime);
                setUserTimestamp(userId, "last_viewed_tasks", newTime);
            }
        } else if (activeTab === "team") {
            if (effectiveLatestTeamTime > lastViewedTeam) {
                const now = Date.now();
                const newTime = Math.max(effectiveLatestTeamTime, now);
                setLastViewedTeam(newTime);
                setUserTimestamp(userId, "last_viewed_team", newTime);
            }
        }
    }, [userId, activeTab, effectiveLatestTaskTime, effectiveLatestTeamTime, lastViewedTasks, lastViewedTeam, initialHighlightDone]);

    // Handle tab switching with highlight snapshot
    const handleTabChange = useCallback((tab: TabType) => {
        // First, mark the CURRENT tab as fully viewed before switching away
        // This prevents the dot from appearing on the tab we're leaving
        if (activeTab === "tasks" && tab !== "tasks") {
            const now = Date.now();
            const freshGlobalTime = getUserTimestamp(userId, "latest_task_update", 0);
            const effectiveTime = Math.max(latestTaskTime, freshGlobalTime);
            const newTime = Math.max(effectiveTime, now);
            setLastViewedTasks(newTime);
            setUserTimestamp(userId, "last_viewed_tasks", newTime);
        } else if (activeTab === "team" && tab !== "team") {
            const now = Date.now();
            const freshGlobalTime = getUserTimestamp(userId, "latest_team_message", 0);
            const effectiveTime = Math.max(latestTeamTime, freshGlobalTime);
            const newTime = Math.max(effectiveTime, now);
            setLastViewedTeam(newTime);
            setUserTimestamp(userId, "last_viewed_team", newTime);
        }

        // Now switch to the new tab
        setActiveTab(tab);

        // Handle the NEW tab: set highlight snapshot and delayed viewed update
        if (tab === "tasks") {
            // Snapshot the current lastViewedTasks for highlighting items newer than this
            setHighlightTasksTime(lastViewedTasks);

            // Delay updating lastViewedTasks to give user time to see highlights
            setTimeout(() => {
                const now = Date.now();
                // Read fresh global timestamp when updating
                const freshGlobalTime = getUserTimestamp(userId, "latest_task_update", 0);
                const effectiveTime = Math.max(latestTaskTime, freshGlobalTime);
                const newTime = Math.max(effectiveTime, now);
                setLastViewedTasks(newTime);
                setUserTimestamp(userId, "last_viewed_tasks", newTime);
            }, VIEW_DELAY_MS);
        } else if (tab === "team") {
            // Snapshot the current lastViewedTeam for highlighting items newer than this
            setHighlightTeamTime(lastViewedTeam);

            // Delay updating lastViewedTeam to give user time to see highlights
            setTimeout(() => {
                const now = Date.now();
                // Read fresh global timestamp when updating
                const freshGlobalTime = getUserTimestamp(userId, "latest_team_message", 0);
                const effectiveTime = Math.max(latestTeamTime, freshGlobalTime);
                const newTime = Math.max(effectiveTime, now);
                setLastViewedTeam(newTime);
                setUserTimestamp(userId, "last_viewed_team", newTime);
            }, VIEW_DELAY_MS);
        }
    }, [userId, activeTab, lastViewedTasks, lastViewedTeam, latestTaskTime, latestTeamTime]);

    return {
        activeTab,
        lastViewedTasks,
        lastViewedTeam,
        highlightTasksTime,
        highlightTeamTime,
        hasUnreadTasks,
        hasUnreadTeam,
        handleTabChange,
    };
};
