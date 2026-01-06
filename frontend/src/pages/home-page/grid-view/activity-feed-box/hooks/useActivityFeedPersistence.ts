import { useState, useCallback, useEffect } from "react";
import { LATEST_TEAM_MESSAGE_KEY } from "../../../../../contexts/ChatContext";

type TabType = "tasks" | "team";

interface UseActivityFeedPersistenceProps {
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

/**
 * Custom hook to manage activity feed tab state and persistence logic
 * - Manages localStorage for last viewed timestamps
 * - Handles tab switching and highlight snapshots
 * - Calculates unread indicators
 * - Reads global latest team message timestamp for cross-page notifications
 */
export const useActivityFeedPersistence = ({
    latestTaskTime,
    latestTeamTime,
}: UseActivityFeedPersistenceProps): UseActivityFeedPersistenceReturn => {
    // Active tab state
    const [activeTab, setActiveTab] = useState<TabType>("tasks");

    // Persistent storage for "last viewed" timestamps
    const [lastViewedTasks, setLastViewedTasks] = useState<number>(() => {
        const saved = localStorage.getItem("activity_feed_last_viewed_tasks");
        return saved ? parseInt(saved, 10) : Date.now();
    });

    const [lastViewedTeam, setLastViewedTeam] = useState<number>(() => {
        const saved = localStorage.getItem("activity_feed_last_viewed_team");
        return saved ? parseInt(saved, 10) : Date.now();
    });

    // Snapshot timestamps for highlighting "new" items when viewing
    const [highlightTasksTime, setHighlightTasksTime] = useState<number>(lastViewedTasks);
    const [highlightTeamTime, setHighlightTeamTime] = useState<number>(lastViewedTeam);

    // Read the global latest team message timestamp from localStorage
    // This is set by ChatContext when WebSocket messages arrive (even when not on home page)
    const globalLatestTeamTime = (() => {
        const saved = localStorage.getItem(LATEST_TEAM_MESSAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    })();

    // Use the maximum of prop latestTeamTime and global timestamp
    // This ensures we catch messages that arrived while on another page
    const effectiveLatestTeamTime = Math.max(latestTeamTime, globalLatestTeamTime);

    // Derived unread state (Show dot if new data > last viewed AND tab not active)
    const hasUnreadTasks = activeTab !== "tasks" && latestTaskTime > lastViewedTasks;
    const hasUnreadTeam = activeTab !== "team" && effectiveLatestTeamTime > lastViewedTeam;

    // Auto-update "last viewed" while staying on the active tab
    useEffect(() => {
        if (activeTab === "tasks") {
            if (latestTaskTime > lastViewedTasks) {
                const now = Date.now();
                const newTime = Math.max(latestTaskTime, now);
                setLastViewedTasks(newTime);
                localStorage.setItem("activity_feed_last_viewed_tasks", newTime.toString());
            }
        } else if (activeTab === "team") {
            if (effectiveLatestTeamTime > lastViewedTeam) {
                const now = Date.now();
                const newTime = Math.max(effectiveLatestTeamTime, now);
                setLastViewedTeam(newTime);
                localStorage.setItem("activity_feed_last_viewed_team", newTime.toString());
            }
        }
    }, [activeTab, latestTaskTime, effectiveLatestTeamTime, lastViewedTasks, lastViewedTeam]);

    // Handle tab switching with highlight snapshot
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);

        if (tab === "tasks") {
            setHighlightTasksTime(lastViewedTasks);
            const now = Date.now();
            const newTime = Math.max(latestTaskTime, now);
            setLastViewedTasks(newTime);
            localStorage.setItem("activity_feed_last_viewed_tasks", newTime.toString());
        } else if (tab === "team") {
            setHighlightTeamTime(lastViewedTeam);
            const now = Date.now();
            // Read fresh global timestamp when switching tabs
            const freshGlobalTime = parseInt(localStorage.getItem(LATEST_TEAM_MESSAGE_KEY) || "0", 10);
            const effectiveTime = Math.max(latestTeamTime, freshGlobalTime);
            const newTime = Math.max(effectiveTime, now);
            setLastViewedTeam(newTime);
            localStorage.setItem("activity_feed_last_viewed_team", newTime.toString());
        }
    }, [lastViewedTasks, lastViewedTeam, latestTaskTime, latestTeamTime]);

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
