import React from "react";
import { MessageSquare, ClipboardList } from "lucide-react";

type TabType = "tasks" | "team";

interface ActivityFeedTabsProps {
    activeTab: TabType;
    hasUnreadTasks: boolean;
    hasUnreadTeam: boolean;
    isDarkMode: boolean;
    onTabChange: (tab: TabType) => void;
}

/**
 * Tab buttons for Activity Feed
 * - Displays task and team message tabs
 * - Shows unread indicators (dots)
 */
export const ActivityFeedTabs: React.FC<ActivityFeedTabsProps> = ({
    activeTab,
    hasUnreadTasks,
    hasUnreadTeam,
    isDarkMode,
    onTabChange,
}) => {
    const getTabClass = (tab: TabType, isActive: boolean) => {
        const baseClass = "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all";

        if (isActive) {
            if (tab === "tasks") {
                return `${baseClass} ${isDarkMode
                        ? "bg-slate-700 text-blue-400 border-b-2 border-blue-400"
                        : "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    }`;
            } else {
                return `${baseClass} ${isDarkMode
                        ? "bg-slate-700 text-purple-400 border-b-2 border-purple-400"
                        : "bg-purple-50 text-purple-600 border-b-2 border-purple-500"
                    }`;
            }
        }

        return `${baseClass} ${isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`;
    };

    return (
        <div className="flex">
            {/* Tasks Tab */}
            <button
                onClick={() => onTabChange("tasks")}
                data-tour="tasks-updates-tab"
                className={getTabClass("tasks", activeTab === "tasks")}
            >
                <div className="relative">
                    <ClipboardList className="w-4 h-4" />
                    {hasUnreadTasks && (
                        <span
                            className={`absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ${isDarkMode ? "ring-slate-800" : "ring-white"
                                } animate-pulse`}
                        />
                    )}
                </div>
                <span>עדכוני משימות</span>
            </button>

            {/* Team Tab */}
            <button
                onClick={() => onTabChange("team")}
                data-tour="team-updates-tab"
                className={getTabClass("team", activeTab === "team")}
            >
                <div className="relative">
                    <MessageSquare className="w-4 h-4" />
                    {hasUnreadTeam && (
                        <span
                            className={`absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ${isDarkMode ? "ring-slate-800" : "ring-white"
                                } animate-pulse`}
                        />
                    )}
                </div>
                <span>עדכוני צוות</span>
            </button>
        </div>
    );
};
