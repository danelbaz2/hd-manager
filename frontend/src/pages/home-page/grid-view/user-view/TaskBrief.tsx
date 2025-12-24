import React from "react";
import { ClipboardList } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { type Task } from "../../../../api/tasksApi";

interface TaskBriefProps {
  tasks: Task[];
  maxItems?: number;
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return { label: "פתוח", color: "bg-green-500" };
    case "in_progress":
      return { label: "בטיפול", color: "bg-amber-500" };
    case "completed":
      return { label: "הושלם", color: "bg-blue-500" };
    default:
      return { label: "פתוח", color: "bg-slate-400" };
  }
};

const TaskBrief: React.FC<TaskBriefProps> = ({ tasks, maxItems = 5 }) => {
  const { isDarkMode } = useTheme();
  const displayTasks = tasks.slice(0, maxItems);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5 text-blue-500" />
        <h3
          className={`font-bold text-sm ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          המשימות שלי ({tasks.length})
        </h3>
      </div>

      {/* Task List */}
      {displayTasks.length === 0 ? (
        <div
          className={`text-center py-6 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <p className="text-sm">אין משימות להצגה</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => {
            const status = getStatusLabel(task.status);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
                }`}
              >
                <span
                  className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}
                >
                  {status.label}
                </span>
                <span
                  className={`text-sm font-medium truncate flex-1 mr-3 text-right ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length > maxItems && (
        <div
          className={`text-center mt-3 text-xs ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          +{tasks.length - maxItems} משימות נוספות
        </div>
      )}
    </div>
  );
};

export default TaskBrief;
