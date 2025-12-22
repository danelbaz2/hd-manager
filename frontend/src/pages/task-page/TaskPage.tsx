import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { useTheme, useSettings, useViewState, useAuth } from "../../contexts";
import { KanbanBoard } from "./parts";
import { updateTask, type Task, type TaskStatus } from "../../api/tasksApi";
import { useTaskModal } from "../../components/modal-task";

interface LocationState {
  selectedUserId?: string;
  userName?: string;
}

type ViewMode = "daily" | "weekly" | "monthly";

const VIEW_MODES = [
  { id: "daily" as ViewMode, label: "יומי", icon: Calendar },
  { id: "weekly" as ViewMode, label: "שבועי", icon: CalendarDays },
  { id: "monthly" as ViewMode, label: "חודשי", icon: CalendarRange },
];

// Get week start date (Sunday) for a given date
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Filter tasks by date range
const filterTasksByDateRange = (
  tasks: Task[],
  selectedDate: number,
  viewMode: ViewMode
): Task[] => {
  const date = new Date(selectedDate);

  if (viewMode === "daily") {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return taskDate >= start && taskDate <= end;
    });
  }

  if (viewMode === "weekly") {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      const taskStart = new Date(task.date || 0);
      const taskEnd = task.deadline
        ? new Date(task.deadline)
        : new Date(taskStart);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(23, 59, 59, 999);
      // Task overlaps with week if it starts before week ends AND ends after week starts
      return taskStart <= weekEnd && taskEnd >= weekStart;
    });
  }

  // Monthly - filter by month
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return tasks.filter((task) => {
    if (!task.date) return false;
    const taskDate = new Date(task.date);
    return taskDate >= monthStart && taskDate <= monthEnd;
  });
};

const TaskPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { tasks, users, refreshTasks, refreshTaskHistory } = useSettings();
  const { viewMode, setViewMode, selectedDate } = useViewState();
  const { user: authUser } = useAuth();
  const { openTaskModal, setOnTaskUpdated } = useTaskModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Optimistic UI state
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);

  // Sync with global state
  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  // Get user info from location state (passed from home page)
  // If no user selected, default to the authenticated user
  const state = location.state as LocationState | null;

  // Determine selected user: from navigation state OR fallback to authenticated user
  const selectedUserId = state?.selectedUserId || authUser?.id || "";
  const userName = state?.userName || authUser?.fullName || "";

  // Filter tasks by selected date/week AND selected user
  const filteredTasks = useMemo(() => {
    // First filter by date range
    const dateFilteredTasks = filterTasksByDateRange(
      optimisticTasks,
      selectedDate,
      viewMode
    );
    // Then filter by selected user
    return dateFilteredTasks.filter((task) =>
      task.responsibleUserIds?.includes(selectedUserId)
    );
  }, [optimisticTasks, selectedDate, viewMode, selectedUserId]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/");
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
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
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            base: {
              ...(t.base || {
                isDeleted: false,
                createdAt: Date.now(),
                entityType: "task",
              }),
              updatedAt: Date.now(),
            },
          };
        })
      );

      try {
        // 2. API Call
        const response = await updateTask(taskId, { status: newStatus });

        // 3. Sync - delay refresh to let optimistic UI settle
        setTimeout(() => {
          if (response.success) {
            refreshTasks();
            refreshTaskHistory();
          } else {
            console.error("Failed to update task status:", response.error);
            refreshTasks(); // Revert to server state
          }
        }, 300);
      } catch (error) {
        console.error("Error updating task status:", error);
        refreshTasks(); // Revert to server state
      }
    },
    [optimisticTasks, refreshTasks, refreshTaskHistory]
  );

  // Handle task click - open task modal
  const handleTaskClick = useCallback((task: Task) => {
    setOnTaskUpdated(() => () => { refreshTasks(); refreshTaskHistory(); });
    openTaskModal(task);
  }, [openTaskModal, setOnTaskUpdated, refreshTasks, refreshTaskHistory]);

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
          ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
        `}
      >
        {/* Right side - Title with back button */}
        <div className="flex items-center gap-3">
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
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <h1
            className={`
              text-xl lg:text-2xl font-bold
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            המשימות של {userName}
          </h1>
        </div>

        {/* Left side - View Mode Toggle (Same as HomePage) */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* View Mode Toggle (Daily/Weekly/Monthly) */}
          <div
            className={`
              flex items-center p-1 rounded-lg
              ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
            `}
          >
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleViewModeChange(mode.id)}
                className={`
                  flex items-center gap-1.5 lg:gap-2
                  px-3 lg:px-4 py-1.5 lg:py-2
                  rounded-md
                  text-xs lg:text-sm font-medium
                  transition-all duration-200
                  ${viewMode === mode.id
                    ? isDarkMode
                      ? "bg-slate-600 text-white shadow-sm"
                      : "bg-white text-blue-600 shadow-sm"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                <mode.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tasks={filteredTasks}
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
