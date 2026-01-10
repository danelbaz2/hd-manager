import { useState, useCallback, useEffect, useRef } from "react";
import { 
    getActivityFeedTimestamp, 
    setActivityFeedTimestamp,
    migrateOldStorage 
} from "../../../../../utils/userStorage";

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
 * - Uses centralized user storage (JSON format) for multi-user support
 * - Manages localStorage for last viewed timestamps
 * - Handles tab switching and highlight snapshots
 * - Calculates unread indicators based on latest message times from props
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

    // Migrate old storage format on first render (if needed)
    useEffect(() => {
        if (userId) {
            migrateOldStorage(userId);
        }
    }, [userId]);

    // Persistent storage for "last viewed" timestamps (user-specific)
    const [lastViewedTasks, setLastViewedTasks] = useState<number>(() => {
        return getActivityFeedTimestamp(userId, "lastViewedTasks");
    });

    const [lastViewedTeam, setLastViewedTeam] = useState<number>(() => {
        return getActivityFeedTimestamp(userId, "lastViewedTeam");
    });

    // Re-initialize when userId changes (e.g., after login)
    useEffect(() => {
        if (userId) {
            const storedTasksTime = getActivityFeedTimestamp(userId, "lastViewedTasks");
            const storedTeamTime = getActivityFeedTimestamp(userId, "lastViewedTeam");
            setLastViewedTasks(storedTasksTime);
            setLastViewedTeam(storedTeamTime);
            // Also reset highlight times to match - this prevents showing "new" badges
            // for already-viewed items after login
            setHighlightTasksTime(storedTasksTime);
            setHighlightTeamTime(storedTeamTime);
        }
    }, [userId]);

    // Snapshot timestamps for highlighting "new" items when viewing
    const [highlightTasksTime, setHighlightTasksTime] = useState<number>(lastViewedTasks);
    const [highlightTeamTime, setHighlightTeamTime] = useState<number>(lastViewedTeam);

    // Derived unread state (Show dot if new data > last viewed AND tab not active)
    // Only show dot when userId is valid (ensures timestamps are loaded from storage)
    // Latest times come directly from props (calculated from actual messages data)
    const hasUnreadTasks = !!userId && activeTab !== "tasks" && latestTaskTime > lastViewedTasks;
    const hasUnreadTeam = !!userId && activeTab !== "team" && latestTeamTime > lastViewedTeam;

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
                if (activeTab === "tasks" && latestTaskTime > lastViewedTasks) {
                    const now = Date.now();
                    const newTime = Math.max(latestTaskTime, now);
                    setLastViewedTasks(newTime);
                    setActivityFeedTimestamp(userId, "lastViewedTasks", newTime);
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
            if (latestTaskTime > lastViewedTasks) {
                const now = Date.now();
                const newTime = Math.max(latestTaskTime, now);
                setLastViewedTasks(newTime);
                setActivityFeedTimestamp(userId, "lastViewedTasks", newTime);
            }
        } else if (activeTab === "team") {
            if (latestTeamTime > lastViewedTeam) {
                const now = Date.now();
                const newTime = Math.max(latestTeamTime, now);
                setLastViewedTeam(newTime);
                setActivityFeedTimestamp(userId, "lastViewedTeam", newTime);
            }
        }
    }, [userId, activeTab, latestTaskTime, latestTeamTime, lastViewedTasks, lastViewedTeam, initialHighlightDone]);

    // Handle tab switching with highlight snapshot
    const handleTabChange = useCallback((tab: TabType) => {
        // First, mark the CURRENT tab as fully viewed before switching away
        // This prevents the dot from appearing on the tab we're leaving
        if (activeTab === "tasks" && tab !== "tasks") {
            const now = Date.now();
            const newTime = Math.max(latestTaskTime, now);
            setLastViewedTasks(newTime);
            setActivityFeedTimestamp(userId, "lastViewedTasks", newTime);
        } else if (activeTab === "team" && tab !== "team") {
            const now = Date.now();
            const newTime = Math.max(latestTeamTime, now);
            setLastViewedTeam(newTime);
            setActivityFeedTimestamp(userId, "lastViewedTeam", newTime);
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
                const newTime = Math.max(latestTaskTime, now);
                setLastViewedTasks(newTime);
                setActivityFeedTimestamp(userId, "lastViewedTasks", newTime);
            }, VIEW_DELAY_MS);
        } else if (tab === "team") {
            // Snapshot the current lastViewedTeam for highlighting items newer than this
            setHighlightTeamTime(lastViewedTeam);

            // Delay updating lastViewedTeam to give user time to see highlights
            setTimeout(() => {
                const now = Date.now();
                const newTime = Math.max(latestTeamTime, now);
                setLastViewedTeam(newTime);
                setActivityFeedTimestamp(userId, "lastViewedTeam", newTime);
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
