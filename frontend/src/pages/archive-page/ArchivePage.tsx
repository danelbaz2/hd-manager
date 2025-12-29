import React, { useState, useEffect, useCallback } from "react";
import { useTheme, useSettings } from "../../contexts";
import HeaderArchivePage from "./HeaderArchivePage";
import ListTaskArchive from "./ListTaskArchive";
import {
  type ArchiveFilters,
  defaultFilters,
} from "../../schemas/archiveTypes";
import { getAllTasks, type Task } from "../../api/tasksApi";
import { Loader2 } from "lucide-react";
import { useTaskModal } from "../../components/modal/modal-task";

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
        <HeaderArchivePage filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="flex-1 p-4 w-full overflow-auto">
        <ListTaskArchive
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
