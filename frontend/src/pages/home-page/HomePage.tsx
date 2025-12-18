import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import HeaderHomePage from "./HeaderHomePage";
import NewTaskModal from "../../components/modal-new-task";

const HomePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const handleCreateTask = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleTaskCreated = () => {
    // TODO: Refresh task list
    console.log("Task created, refreshing list...");
  };

  const handleSearch = (query: string, filterType: string) => {
    console.log("Search:", query, "Filter:", filterType);
    // TODO: Implement search functionality
  };

  const handleViewModeChange = (mode: string) => {
    console.log("View mode changed to:", mode);
    // TODO: Update task view based on mode
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Header with filter, toggle, and create button */}
      <HeaderHomePage
        onCreateTask={handleCreateTask}
        onSearch={handleSearch}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 overflow-y-auto
          p-4 lg:p-6 xl:p-8
          ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
        `}
      >
        {/* Task content will go here */}
        <div
          className={`
            text-center py-16
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}
          `}
        >
          <p className="text-lg">אזור המשימות יופיע כאן</p>
          <p className="text-sm mt-2">
            בחר תאריך ולחץ על "יצירת משימה" כדי להתחיל
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
