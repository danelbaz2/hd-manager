import React, { useMemo, useState, useCallback } from "react";
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
import { DEMO_TASKS, DEMO_HISTORY } from "../../../../components/demos/shared/tourData";
import { UpdatesTask } from "./updates-task";
import { UpdateTeam } from "./update-team";
import { type TeamMessage } from "./update-team/types";

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
  } = useSettings();
  const { selectedDate } = useViewState();

  const { state: tourState } = useTour();
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const { openTaskModal } = useTaskModal();
  const { user } = useAuth();

  const isTourActive = tourState.isActive && tourState.currentPageId === "home";
  const isAdmin = user?.role === "admin";

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

  // Handle activity click
  const handleActivityClick = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        openTaskModal(task, { enableFileHandle: false });
      }
    },
    [tasks, openTaskModal]
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
      className={`h-full flex flex-col rounded-2xl border overflow-hidden ${isDarkMode
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-slate-200"
        }`}
    >
      {/* Header with Tabs */}
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

        <div className="flex" dir="rtl">
          <button
            onClick={() => setActiveTab("tasks")}
            data-tour="tasks-updates-tab"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${activeTab === "tasks"
              ? isDarkMode
                ? "bg-slate-700 text-blue-400 border-b-2 border-blue-400"
                : "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>פעילות משימות</span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            data-tour="team-updates-tab"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all ${activeTab === "team"
              ? isDarkMode
                ? "bg-slate-700 text-purple-400 border-b-2 border-purple-400"
                : "bg-purple-50 text-purple-600 border-b-2 border-purple-500"
              : isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
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
            isAdmin={isAdmin}
            messagesOverride={teamUpdatesOverride}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityFeedBox;
