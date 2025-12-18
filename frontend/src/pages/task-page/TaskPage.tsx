import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme, useSettings } from "../../contexts";
import { KanbanBoard } from "./parts";
import { updateTask, type Task, type TaskStatus } from "../../api/tasksApi";

interface LocationState {
  selectedUserId?: string;
  userName?: string;
}

const TaskPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { tasks, users, refreshTasks } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Optimistic UI state
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);

  // Sync with global state
  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  // Get user info from location state (passed from home page)
  const state = location.state as LocationState | null;
  const selectedUserId = state?.selectedUserId || "";
  const userName = state?.userName || "";

  // Handle back navigation
  const handleBack = () => {
    navigate("/");
  };

  // Handle task status change (drag & drop) with Optimistic UI
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      // Find task to check current status (using optimistic state to prevent double updates)
      const task = optimisticTasks.find((t) => t.id === taskId);
      const currentStatus = task?.status || "pending";

      // If status hasn't changed, do nothing
      if (currentStatus === newStatus) {
        return;
      }

      // 1. Optimistic update
      setOptimisticTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      try {
        // 2. API Call
        const response = await updateTask(taskId, { status: newStatus });

        // 3. Sync/Revert
        if (response.success) {
          refreshTasks();
        } else {
          console.error("Failed to update task status:", response.error);
          refreshTasks(); // Revert to server state
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        refreshTasks(); // Revert to server state
      }
    },
    [optimisticTasks, refreshTasks]
  );

  // Handle task click
  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
    // TODO: Open task detail modal
  };

  // If no user is selected, redirect to home
  if (!selectedUserId) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center h-full
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        <p className="text-lg mb-4">לא נבחר משתמש</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" dir="rtl">
      {/* Header */}
      <header
        className={`
          flex items-center justify-between
          px-4 lg:px-6 xl:px-8
          py-3 lg:py-4
          shrink-0
          ${isDarkMode
            ? "bg-slate-900"
            : "bg-slate-50"
          }
        `}
      >
        {/* Right side - Title with back button */}
        <div className="flex items-center gap-3">
          <h1
            className={`
              text-xl lg:text-2xl font-bold
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            המשימות של {userName}
          </h1>
          <button
            onClick={handleBack}
            className={`
              p-2 rounded-full
              transition-colors
              ${isDarkMode
                ? "hover:bg-slate-700 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
              }
            `}
            aria-label="חזרה לדף הבית"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* Left side - Empty for now, can add filters later */}
        <div />
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tasks={optimisticTasks}
          users={users}
          selectedUserId={selectedUserId}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
};

export default TaskPage;
