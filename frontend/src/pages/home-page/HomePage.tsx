import React, { useState, useMemo, useCallback } from "react";
import { useTheme, useSettings, useViewState } from "../../contexts";
import HeaderHomePage from "./HeaderHomePage";
import NewTaskModal from "../../components/modal-new-task";
import { GridView } from "./grid-view";
import { ListView } from "./list-view";
import { TagsView } from "./tags-view";
import { filterTasksByDateRange } from "./shared";
import { useTaskModal } from "../../components/modal-task";
import { type Task } from "../../api/tasksApi";

const HomePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { users, secondaryTags, tasks, refreshTasks, refreshTaskHistory } =
    useSettings();
  const { viewMode, setViewMode, displayMode, setDisplayMode, selectedDate } =
    useViewState();
  const { openTaskModal } = useTaskModal();

  // Modal state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Search state for tags view
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on current view (date range only)
  const filteredTasks = useMemo(() => {
    return filterTasksByDateRange(tasks, selectedDate, viewMode);
  }, [tasks, selectedDate, viewMode]);

  // Handlers
  const handleCreateTask = () => setIsNewTaskModalOpen(true);

  const handleTaskCreated = () => {
    refreshTasks();
    refreshTaskHistory();
  };

  const handleSearchChange = (query: string) => setSearchQuery(query);

  // Handle task click - open task modal
  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskModal(task, { enableFileHandle: false });
    },
    [openTaskModal]
  );

  // Render content based on display mode
  const renderContent = () => {
    switch (displayMode) {
      case "grid":
        return (
          <GridView users={users} tasks={filteredTasks} viewMode={viewMode} />
        );

      case "list":
        return (
          <ListView tasks={filteredTasks} users={users} tags={secondaryTags} />
        );

      case "tags":
        return (
          <TagsView
            tasks={filteredTasks}
            users={users}
            searchQuery={searchQuery}
            onTaskClick={handleTaskClick}
          />
        );

      default:
        return (
          <GridView users={users} tasks={filteredTasks} viewMode={viewMode} />
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        initialDate={selectedDate}
      />

      {/* Header */}
      <HeaderHomePage
        onCreateTask={handleCreateTask}
        onViewModeChange={setViewMode}
        onDisplayModeChange={setDisplayMode}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        displayMode={displayMode}
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8
          ${
            isDarkMode
              ? "bg-slate-900 dark-scrollbar"
              : "bg-slate-50 light-scrollbar"
          }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default HomePage;
