import React, { useState, useCallback, memo } from "react";
import { useTheme, useSettings, useTaskUpdates } from "../../contexts";
import HeaderArchivePage from "./HeaderArchivePage";
import ListTaskArchive from "./ListTaskArchive";
import {
  type ArchiveFilters,
  defaultFilters,
} from "../../schemas/archiveTypes";
import { type Task, type TaskHistoryEntry } from "../../api/tasksApi";
import { useTasksQuery } from "../../api/queries";
import { Loader2 } from "lucide-react";
import { useTaskModal } from "../../components/modal/modal-task";

// Memoized list component to prevent unnecessary re-renders
const MemoizedListTaskArchive = memo(ListTaskArchive);

const ArchivePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  // Use useSettings to get users and tags with computed colors (same as home page)
  const { users, primaryTags, secondaryTags } = useSettings();
  const [filters, setFilters] = useState<ArchiveFilters>(defaultFilters);
  const { openTaskModal } = useTaskModal();

  // Use React Query for fetching tasks - data is cached and won't refetch if fresh
  const { data: tasks = [], isLoading } = useTasksQuery();

  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskModal(task, { enableFileHandle: false });
    },
    [openTaskModal]
  );

  // Subscribe to real-time task updates via WebSocket
  // React Query will handle the cache updates
  const handleTaskUpdate = useCallback((_update: TaskHistoryEntry) => {
    // WebSocket updates are handled by SettingsContext which invalidates the tasks query
    // No need to manually update - React Query cache will be refreshed
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
