import React from "react";
import { ClipboardList } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { type Task } from "../../../../api/tasksApi";
import { useTaskModal } from "../../../../components/modal/modal-task";

interface TaskBriefProps {
  tasks: Task[];
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return { label: "פתוח", color: "bg-green-100 text-green-700" };
    case "in_progress":
      return { label: "בטיפול", color: "bg-amber-100 text-amber-700" };
    case "completed":
      return { label: "סגור", color: "bg-blue-100 text-blue-700" };
    default:
      return { label: "פתוח", color: "bg-green-100 text-green-700" };
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-amber-400";
    case "low":
      return "bg-green-400";
    default:
      return "bg-slate-300";
  }
};

// Priority order: high > medium > low
const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

// Status order: pending > in_progress > completed
const statusOrder: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  completed: 2,
};

const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const statusA = statusOrder[a.status || "pending"] ?? 4;
    const statusB = statusOrder[b.status || "pending"] ?? 4;
    if (statusA !== statusB) return statusA - statusB;

    const priorityA = priorityOrder[a.priority || "medium"] ?? 1;
    const priorityB = priorityOrder[b.priority || "medium"] ?? 1;
    if (priorityA !== priorityB) return priorityA - priorityB;

    // Sort by date (new to old) using base.createdAt or date field
    const dateA = a.base?.createdAt || a.date || 0;
    const dateB = b.base?.createdAt || b.date || 0;
    return dateB - dateA;
  });
};

const TaskBrief: React.FC<TaskBriefProps> = ({ tasks }) => {
  const { isDarkMode } = useTheme();
  const { openTaskModal } = useTaskModal();
  const sortedTasks = sortTasks(tasks);

  const handleTaskClick = (task: Task) => {
    openTaskModal(task);
  };

  return (
    <div
      className={`rounded-2xl border p-3 flex flex-col h-full ${isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
        }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="w-5 h-5 text-blue-500" />
        <h3
          className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-800"
            }`}
        >
          המשימות שלי ({tasks.length})
        </h3>
      </div>

      {/* Task List - Scrollable */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
          }`}
      >
        {sortedTasks.length === 0 ? (
          <div
            className={`text-center py-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
          >
            <p className="text-sm">אין משימות להצגה</p>
          </div>
        ) : (
          <div className="space-y-2 pr-1">
            {sortedTasks.map((task, index) => {
              const status = getStatusLabel(task.status);
              const priorityColor = getPriorityColor(task.priority);

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`flex items-center gap-3 p-3 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode
                    ? "bg-slate-700/50 hover:bg-slate-700"
                    : "bg-slate-50 hover:bg-slate-100"
                    }`}
                >
                  {/* Priority indicator bar on right edge */}
                  <div
                    className={`absolute right-0 top-0 bottom-0 w-1 ${priorityColor}`}
                  />

                  {/* Line index on right (after priority bar) */}
                  <span
                    className={`text-xs font-mono shrink-0 w-6 text-center mr-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                  >
                    {index + 1}
                  </span>

                  {/* Title + Tags */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium truncate block ${isDarkMode ? "text-white" : "text-slate-800"
                        }`}
                    >
                      {task.title}
                    </span>
                    {task.primaryTagIds && task.primaryTagIds.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.primaryTagIds
                          .slice(0, 3)
                          .map((tagId: string, i: number) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode
                                ? "bg-slate-600 text-slate-300"
                                : "bg-slate-200 text-slate-600"
                                }`}
                            >
                              {tagId.slice(0, 6)}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Status badge on left */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBrief;
