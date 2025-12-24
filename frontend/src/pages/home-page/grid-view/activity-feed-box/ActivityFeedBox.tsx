import React, { useMemo, useState, useCallback } from "react";
import { MessageSquare, ClipboardList, Megaphone } from "lucide-react";
import { useTheme, useSettings, useViewState } from "../../../../contexts";
import { useTaskModal } from "../../../../components/modal/modal-task";
import { ActivityMessage } from "./ActivityMessage";
import { filterActivitiesByDate, sortActivitiesByTime } from "./activityUtils";

type TabType = "tasks" | "team";

const ActivityFeedBox: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { taskHistory, tasks, users } = useSettings();
  const { selectedDate } = useViewState();

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
        {/* Title */}
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

        {/* Tab Buttons */}
        <div className="flex" dir="rtl">
          <button
            onClick={() => setActiveTab("tasks")}
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
            <ClipboardList className="w-4 h-4" />
            <span>פעילות משימות</span>
            {taskActivities.length > 0 && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "tasks"
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
            <MessageSquare className="w-4 h-4" />
            <span>עדכוני צוות</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`flex-1 overflow-y-auto px-3 py-3 ${
          isDarkMode ? "dark-scrollbar" : "light-scrollbar"
        }`}
        dir="rtl"
      >
        {activeTab === "tasks" ? (
          // Task Activities
          taskActivities.length === 0 ? (
            <div
              className={`text-center py-8 text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              אין פעילות משימות להיום
            </div>
          ) : (
            <div className="space-y-4">
              {taskActivities.map((entry) => (
                <ActivityMessage
                  key={entry.id}
                  entry={entry}
                  taskTitle={taskTitleMap[entry.taskId]}
                  isDarkMode={isDarkMode}
                  users={users}
                  onClick={() => handleActivityClick(entry.taskId)}
                />
              ))}
            </div>
          )
        ) : (
          // Team Updates - Coming Soon
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
              }`}
            >
              <Megaphone
                className={`w-8 h-8 ${
                  isDarkMode ? "text-purple-400" : "text-purple-500"
                }`}
              />
            </div>
            <h4
              className={`font-semibold text-lg mb-2 ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              עדכוני צוות
            </h4>
            <p
              className={`text-sm text-center ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              בקרוב תוכלו לפרסם עדכונים
              <br />
              והודעות לכל הצוות
            </p>
            <span
              className={`mt-4 px-3 py-1 text-xs rounded-full ${
                isDarkMode
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              בפיתוח 🚀
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedBox;
