import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { MessageSquare, ClipboardList } from "lucide-react";
import {
  useTheme,
  useSettings,
  useViewState,
  useAuth,
} from "../../../../contexts";
import { useTaskModal } from "../../../../components/modal/modal-task";
import { type Task, type TaskHistoryEntry } from "../../../../api/tasksApi";
import { type UserData } from "../../../../schemas/userTypes";
import { useTour } from "../../../../components/demos/tour-provider";
import {
  DEMO_TASKS,
  DEMO_HISTORY,
} from "../../../../components/demos/shared/tourData";
import { UpdatesTask } from "./updates-task";
import { UpdateTeam } from "./update-team";
import { type TeamMessage } from "../../../../schemas/teamMessageTypes";
import { socketManager } from "../../../../socket/socketManager";

type TabType = "tasks" | "team";

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
  } = useSettings();
  const { selectedDate } = useViewState();

  const { state: tourState } = useTour();
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const { openTaskModal } = useTaskModal();
  const { user } = useAuth();

  const isTourActive = tourState.isActive && tourState.currentPageId === "home";

  // Notification state for unread updates
  const [hasUnreadTasks, setHasUnreadTasks] = useState(false);
  const [hasUnreadTeam, setHasUnreadTeam] = useState(false);

  // Track which tab is active to avoid showing notification for the current tab
  const activeTabRef = useRef<TabType>(activeTab);
  activeTabRef.current = activeTab;

  // Subscribe to real-time updates for notification dots
  useEffect(() => {
    // Listen for task updates
    const unsubscribeTasks = socketManager.onTaskUpdate(() => {
      // Only show notification if not on the tasks tab
      if (activeTabRef.current !== "tasks") {
        setHasUnreadTasks(true);
      }
    });

    // Listen for chat/team updates
    const unsubscribeChat = socketManager.onChatUpdate(() => {
      // Only show notification if not on the team tab
      if (activeTabRef.current !== "team") {
        setHasUnreadTeam(true);
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeChat();
    };
  }, []);

  // Clear notification when switching to a tab
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    if (tab === "tasks") {
      setHasUnreadTasks(false);
    } else if (tab === "team") {
      setHasUnreadTeam(false);
    }
  }, []);

  // Data Logic
  const tasks = useMemo(() => {
    if (tasksOverride) return tasksOverride;
    if (isTourActive) return [...globalTasks, ...DEMO_TASKS];
    return globalTasks;
  }, [tasksOverride, globalTasks, isTourActive]);

  const demoUpdates = useMemo(() => {
    if (!isTourActive) return undefined;

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    return DEMO_HISTORY.filter((h) => {
      return h.timestamp >= start.getTime() && h.timestamp <= end.getTime();
    }) as TaskHistoryEntry[];
  }, [isTourActive, selectedDate]);

  const users = usersOverride || globalUsers;

  // Handle activity click - finds task from multiple sources
  const handleActivityClick = useCallback(
    async (taskId: string) => {
      // 1. First, try to find the task in the current tasks array
      let task = tasks.find((t) => t.id === taskId);

      if (task) {
        openTaskModal(task, { enableFileHandle: false });
        return;
      }

      // 2. If not found, check the task history for fullTask data
      if (taskHistory && taskHistory.length > 0) {
        // Find the most recent history entry with fullTask for this task
        const historyWithTask = [...taskHistory]
          .filter((h) => h.taskId === taskId && h.fullTask)
          .sort((a, b) => b.timestamp - a.timestamp);

        if (historyWithTask.length > 0 && historyWithTask[0].fullTask) {
          openTaskModal(historyWithTask[0].fullTask, {
            enableFileHandle: false,
          });
          return;
        }
      }

      // 3. If still not found, fetch from API
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
    [tasks, taskHistory, openTaskModal]
  );

  // Map task IDs to titles
  const taskTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    tasks.forEach((task) => {
      if (task.id && task.title) map[task.id] = task.title;
    });
    return map;
  }, [tasks]);

  return (
    <div
      data-tour="activity-feed"
      className={`h-full flex flex-col rounded-2xl border overflow-hidden ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header with Tabs */}
      <div
        className={`border-b ${
          isDarkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 ${
            isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
          }`}
          dir="rtl"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3
            className={`font-bold text-sm ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            עדכונים חמים
          </h3>
        </div>

        <div className="flex" dir="rtl">
          {/* Tasks Tab */}
          <button
            onClick={() => handleTabChange("tasks")}
            data-tour="tasks-updates-tab"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? isDarkMode
                  ? "bg-slate-700 text-blue-400 border-b-2 border-blue-400"
                  : "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                : isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {/* Icon with notification badge */}
            <div className="relative">
              <ClipboardList className="w-4 h-4" />
              {hasUnreadTasks && (
                <span
                  className={`
                    absolute -top-1.5 -right-1.5 
                    w-2.5 h-2.5 rounded-full 
                    bg-red-500 
                    ring-2 ${isDarkMode ? "ring-slate-800" : "ring-white"}
                    animate-pulse
                  `}
                />
              )}
            </div>
            <span>עדכוני משימות</span>
          </button>

          {/* Team Tab */}
          <button
            onClick={() => handleTabChange("team")}
            data-tour="team-updates-tab"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === "team"
                ? isDarkMode
                  ? "bg-slate-700 text-purple-400 border-b-2 border-purple-400"
                  : "bg-purple-50 text-purple-600 border-b-2 border-purple-500"
                : isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {/* Icon with notification badge */}
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {hasUnreadTeam && (
                <span
                  className={`
                    absolute -top-1.5 -right-1.5 
                    w-2.5 h-2.5 rounded-full 
                    bg-red-500 
                    ring-2 ${isDarkMode ? "ring-slate-800" : "ring-white"}
                    animate-pulse
                  `}
                />
              )}
            </div>
            <span>עדכוני צוות</span>
          </button>
        </div>
      </div>

      {/* Content Area - Children handle scrolling */}
      <div className={`flex-1 overflow-hidden relative`} dir="rtl">
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
          />
        ) : (
          <UpdateTeam
            users={users}
            isDarkMode={isDarkMode}
            currentUserId={user?.id}
            messagesOverride={teamUpdatesOverride}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityFeedBox;
