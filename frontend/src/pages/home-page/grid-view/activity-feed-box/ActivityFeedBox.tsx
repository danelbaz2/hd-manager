import React, { useMemo, useState, useCallback } from "react";
import { MessageSquare, ClipboardList, Megaphone } from "lucide-react";
import { useTheme, useSettings, useViewState } from "../../../../contexts";
import { useTaskModal } from "../../../../components/modal/modal-task";
import { ActivityMessage } from "./ActivityMessage";
import { filterActivitiesByDate, sortActivitiesByTime } from "./activityUtils";

import { type Task } from "../../../../api/tasksApi";
import { type UserData } from "../../../../schemas/userTypes";

type TabType = "tasks" | "team";

interface ActivityFeedBoxProps {
  tasksOverride?: Task[];
  usersOverride?: UserData[];
  historyOverride?: any[]; // Using any to avoid complex import cycles for now
}

import { useTour } from "../../../../components/demos/tour-provider";
import { DEMO_TASKS, DEMO_HISTORY, DEMO_TEAM_UPDATES } from "../../../../components/demos/shared/tourData";

// ... existing imports

const ActivityFeedBox: React.FC<ActivityFeedBoxProps> = ({
  tasksOverride,
  usersOverride,
  historyOverride
}) => {
  const { isDarkMode } = useTheme();
  const { taskHistory: globalHistory, tasks: globalTasks, users: globalUsers, primaryTags, secondaryTags } = useSettings();
  const { selectedDate } = useViewState();
  const { state: tourState } = useTour();

  const isTourActive = tourState.isActive && tourState.currentPageId === "home";

  // Use overrides if provided (for demo/tour), otherwise use global state. 
  // If tour is active, merge dummy data to ensure feed is not empty.
  const tasks = useMemo(() => {
    if (tasksOverride) return tasksOverride;
    if (isTourActive) return [...globalTasks, ...DEMO_TASKS];
    return globalTasks;
  }, [tasksOverride, globalTasks, isTourActive]);

  const users = usersOverride || globalUsers;

  const taskHistory = useMemo(() => {
    if (historyOverride) return historyOverride;
    if (isTourActive) return [...globalHistory, ...DEMO_HISTORY];
    return globalHistory;
  }, [historyOverride, globalHistory, isTourActive]);

  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const { openTaskModal } = useTaskModal();

  // Handle activity click - open task modal
  const handleActivityClick = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        openTaskModal(task, { enableFileHandle: false });
      }
    },
    [tasks, openTaskModal]
  );

  // Filter and sort ALL activities for the selected date (including notes)
  const taskActivities = useMemo(() => {
    const filtered = filterActivitiesByDate(taskHistory, selectedDate);
    return sortActivitiesByTime(filtered);
  }, [taskHistory, selectedDate]);

  // Create a map of taskId -> title for display
  const taskTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    tasks.forEach((task) => {
      if (task.id && task.title) {
        map[task.id] = task.title;
      }
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
        {/* Title */}
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

        {/* Tab Buttons */}
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
            {taskActivities.length > 0 && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === "tasks"
                  ? isDarkMode
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-100 text-blue-600"
                  : isDarkMode
                    ? "bg-slate-600 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {taskActivities.length}
              </span>
            )}
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

      {/* Content Area */}
      <div
        className={`flex-1 overflow-y-auto px-3 py-3 ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
          }`}
        dir="rtl"
      >
        {activeTab === "tasks" ? (
          // Task Activities
          taskActivities.length === 0 ? (
            <div
              className={`text-center py-8 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              אין פעילות משימות להיום
            </div>
          ) : (
            <div className="space-y-4">
              {taskActivities.map((entry) => {
                // Check if task is deleted (not in current tasks list)
                const isTaskDeleted = !taskTitleMap[entry.taskId];
                return (
                  <ActivityMessage
                    key={entry.id}
                    entry={entry}
                    taskTitle={taskTitleMap[entry.taskId]}
                    isDarkMode={isDarkMode}
                    users={users}
                    primaryTags={primaryTags}
                    secondaryTags={secondaryTags}
                    isTaskDeleted={isTaskDeleted}
                    onClick={() => handleActivityClick(entry.taskId)}
                  />
                );
              })}
            </div>
          )
        ) : (
          // Team Updates
          (isTourActive) ? (
            <div className="space-y-3">
              {/* @ts-ignore */}
              {DEMO_TEAM_UPDATES.map((update: any) => (
                <div
                  key={update.id}
                  className={`p-3 rounded-xl border ${isDarkMode
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white border-slate-100 shadow-sm"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${update.type === 'announcement' ? 'bg-blue-100 text-blue-600' :
                      update.type === 'celebration' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                      {update.type === 'announcement' && <Megaphone className="w-4 h-4" />}
                      {update.type === 'celebration' && <span className="text-sm">🎉</span>}
                      {update.type === 'update' && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {update.author}
                        </span>
                        <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(update.timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        {update.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Coming Soon Placeholder (Non-tour mode)
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                  }`}
              >
                <Megaphone
                  className={`w-8 h-8 ${isDarkMode ? "text-purple-400" : "text-purple-500"
                    }`}
                />
              </div>
              <h4
                className={`font-semibold text-lg mb-2 ${isDarkMode ? "text-white" : "text-slate-800"
                  }`}
              >
                עדכוני צוות
              </h4>
              <p
                className={`text-sm text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                בקרוב תוכלו לפרסם עדכונים
                <br />
                והודעות לכל הצוות
              </p>
              <span
                className={`mt-4 px-3 py-1 text-xs rounded-full ${isDarkMode
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-purple-100 text-purple-600"
                  }`}
              >
                בפיתוח 🚀
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ActivityFeedBox;
