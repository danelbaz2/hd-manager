import React, { useState, useEffect, useCallback, memo } from "react";
import { useTheme, useSettings, useTaskUpdates } from "../../contexts";
import HeaderArchivePage from "./HeaderArchivePage";
import ListTaskArchive from "./ListTaskArchive";
import {
  type ArchiveFilters,
  defaultFilters,
} from "../../schemas/archiveTypes";
import {
  getAllTasks,
  type Task,
  type TaskHistoryEntry,
} from "../../api/tasksApi";
import { Loader2 } from "lucide-react";
import { useTaskModal } from "../../components/modal/modal-task";

// Memoized list component to prevent unnecessary re-renders
const MemoizedListTaskArchive = memo(ListTaskArchive);

const ArchivePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  // Use useSettings to get users and tags with computed colors (same as home page)
  const { users, primaryTags, secondaryTags } = useSettings();
  const [filters, setFilters] = useState<ArchiveFilters>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openTaskModal } = useTaskModal();

  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskModal(task, { enableFileHandle: false });
    },
    [openTaskModal]
  );

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Only fetch tasks - users and tags come from useSettings context
        const tasksRes = await getAllTasks();
        if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data);
      } catch (error) {
        console.error("Error fetching archive data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Subscribe to real-time task updates via WebSocket
  const handleTaskUpdate = useCallback((update: TaskHistoryEntry) => {
    const { action, taskId, fullTask } = update;

    if (action === "CREATE" && fullTask) {
      // Add new task
      setTasks((prev) => {
        if (prev.some((t) => t.id === fullTask.id)) return prev;
        return [...prev, fullTask as Task];
      });
    } else if (action === "DELETE") {
      // Remove deleted task
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else if (
      [
        "UPDATE",
        "IN_PROGRESS",
        "CLOSE",
        "ASSIGN",
        "PENDING_APPROVAL",
        "APPROVE",
        "REJECT",
        "UPDATE_OPTIONALS",
        "UPDATE_EXTERNAL_SYSTEM",
      ].includes(action) &&
      fullTask
    ) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...(fullTask as Task) } : t))
      );
    }
  }, []);

  // Use the WebSocket hook for real-time updates
  useTaskUpdates(handleTaskUpdate);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center
        ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className={`w-10 h-10 animate-spin
            ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            טוען נתונים...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col
      ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <div className="relative z-10">
        <HeaderArchivePage
          filters={filters}
          onFiltersChange={setFilters}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
        />
      </div>

      <div className="flex-1 p-4 w-full overflow-auto">
        <MemoizedListTaskArchive
          tasks={tasks}
          users={users}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          filters={filters}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
