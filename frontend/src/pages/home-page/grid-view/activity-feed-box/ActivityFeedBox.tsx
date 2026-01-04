import React, { useMemo, useCallback } from "react";
import {
  useTheme,
  useSettings,
  useViewState,
  useAuth,
} from "../../../../contexts";
import { useTaskModal } from "../../../../components/modal/modal-task";
import { type Task } from "../../../../api/tasksApi";
import { type UserData } from "../../../../schemas/userTypes";
import { useTour } from "../../../../components/demos/tour-provider";
import {
  DEMO_TASKS,
  DEMO_HISTORY,
} from "../../../../components/demos/shared/tourData";
import { UpdatesTask } from "./updates-task";
import { UpdateTeam } from "./update-team";
import { type TeamMessage } from "../../../../schemas/teamMessageTypes";
import { useTeamMessages } from "./update-team/useTeamMessages";
import { useActivityFeedPersistence } from "./hooks/useActivityFeedPersistence";
import { ActivityFeedTabs } from "./components/ActivityFeedTabs";
import { useChatUpdates } from "../../../../contexts";

interface ActivityFeedBoxProps {
  tasksOverride?: Task[];
  usersOverride?: UserData[];
  teamUpdatesOverride?: TeamMessage[];
}

const ActivityFeedBox: React.FC<ActivityFeedBoxProps> = ({
  tasksOverride,
  usersOverride,
  teamUpdatesOverride,
}) => {
  const { isDarkMode } = useTheme();
  const {
    tasks: globalTasks,
    users: globalUsers,
    primaryTags,
    secondaryTags,
    refreshTasks,
    taskHistory,
    getHistoryForDate,
  } = useSettings();
  const { selectedDate } = useViewState();
  const { user } = useAuth();
  const { openTaskModal } = useTaskModal();
  const { state: tourState } = useTour();
  const isTourActive = tourState.isActive && tourState.currentPageId === "home";

  // Use demo data in tour mode, otherwise use real/override data
  const tasks = isTourActive ? DEMO_TASKS : (tasksOverride || globalTasks);
  const users = usersOverride || globalUsers;

  // Team messages - need to fetch even when not on team tab for notification dot
  const { messages: apiTeamMessages, fetchMessages: fetchTeamMessages } = useTeamMessages();
  const teamMessages = teamUpdatesOverride || apiTeamMessages;

  // Subscribe to chat updates even when not on team tab (for notification dot)
  useChatUpdates(fetchTeamMessages, { enabled: !teamUpdatesOverride });

  // Demo updates for tour mode
  const demoUpdates = useMemo(() => {
    if (!isTourActive) return undefined;
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return DEMO_HISTORY.filter((h) => {
      return h.timestamp >= start.getTime() && h.timestamp <= end.getTime();
    });
  }, [isTourActive, selectedDate]);

  // Map task IDs to titles for UpdatesTask
  const taskTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    tasks.forEach((task) => {
      if (task.id && task.title) map[task.id] = task.title;
    });
    return map;
  }, [tasks]);

  // Handle activity click
  const handleActivityClick = useCallback(
    async (taskId: string) => {
      let task = tasks.find((t) => t.id === taskId);
      if (task) {
        openTaskModal(task, { enableFileHandle: false });
        return;
      }
      // If not found, try fetching from API
      try {
        const { getTaskById } = await import("../../../../api/tasksApi");
        const response = await getTaskById(taskId);
        if (response.success && response.data) {
          openTaskModal(response.data, { enableFileHandle: false });
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
      }
    },
    [tasks, openTaskModal]
  );

  // Calculate latest timestamps for persistence
  const latestTaskTime = useMemo(() => {
    if (!taskHistory || taskHistory.length === 0) return 0;
    const date = selectedDate ? new Date(selectedDate) : new Date();
    date.setHours(0, 0, 0, 0);
    const todayUpdates = isTourActive ? demoUpdates : getHistoryForDate(date.getTime());
    if (!todayUpdates || todayUpdates.length === 0) return 0;
    return Math.max(...todayUpdates.map((t) => t.timestamp));
  }, [taskHistory, selectedDate, getHistoryForDate, isTourActive, demoUpdates]);

  const latestTeamTime = useMemo(() => {
    if (!teamMessages || teamMessages.length === 0) return 0;
    return Math.max(...teamMessages.map((m) => m.base?.createdAt || 0));
  }, [teamMessages]);

  // Use persistence hook for tab management
  const {
    activeTab,
    highlightTasksTime,
    highlightTeamTime,
    hasUnreadTasks,
    hasUnreadTeam,
    handleTabChange,
  } = useActivityFeedPersistence({ latestTaskTime, latestTeamTime });

  return (
    <div
      data-tour="activity-feed"
      className={`h-full flex flex-col rounded-2xl border overflow-hidden ${isDarkMode
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-slate-200"
        }`}
    >
      {/* Header with "Hot Updates" title */}
      <div
        className={`border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"
          }`}
      >
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 ${isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
            }`}
          dir="rtl"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3
            className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-800"
              }`}
          >
            עדכונים חמים
          </h3>
        </div>

        {/* Tab Navigation */}
        <div dir="rtl">
          <ActivityFeedTabs
            activeTab={activeTab}
            hasUnreadTasks={hasUnreadTasks}
            hasUnreadTeam={hasUnreadTeam}
            isDarkMode={isDarkMode}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative" dir="rtl">
        {activeTab === "tasks" ? (
          <UpdatesTask
            taskTitleMap={taskTitleMap}
            users={users}
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
            isDarkMode={isDarkMode}
            selectedDate={selectedDate}
            onUpdateClick={handleActivityClick}
            onDataRefresh={refreshTasks}
            updatesOverride={demoUpdates}
            lastSeen={highlightTasksTime}
          />
        ) : (
          <UpdateTeam
            users={users}
            isDarkMode={isDarkMode}
            currentUserId={user?.id}
            messagesOverride={teamMessages}
            lastSeen={highlightTeamTime}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityFeedBox;
