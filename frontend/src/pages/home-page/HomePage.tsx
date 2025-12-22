import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, useSettings, useViewState } from "../../contexts";
import HeaderHomePage from "./HeaderHomePage";
import NewTaskModal from "../../components/modal-new-task";
import { UserCardGrid, TaskListDaily, TaskListWeekly } from "./parts";
import { type Task } from "../../api/tasksApi";
import { type UserData } from "../../schemas/userTypes";

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
  viewMode: "daily" | "weekly" | "monthly"
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
      const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart);
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

const HomePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { users, secondaryTags, tasks, refreshTasks } = useSettings();
  const { viewMode, setViewMode, displayMode, setDisplayMode, selectedDate } = useViewState();
  const navigate = useNavigate();

  // Modal state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Filter tasks based on current view (memoized for performance)
  const filteredTasks = useMemo(() => {
    return filterTasksByDateRange(tasks, selectedDate, viewMode);
  }, [tasks, selectedDate, viewMode]);

  const handleCreateTask = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleTaskCreated = () => {
    refreshTasks(); // Refresh task list after creation
  };

  const handleSearch = (query: string, filterType: string) => {
    console.log("Search:", query, "Filter:", filterType);
    // TODO: Implement search functionality
  };

  // Handle user card click - navigate to tasks page with user in state
  const handleUserClick = (user: UserData) => {
    // Navigate to tasks page, passing userId via state (not URL)
    navigate("/tasks", { state: { selectedUserId: user.id, userName: user.fullName } });
  };

  // Handle task click (for weekly view)
  const handleTaskClick = (task: Task) => {
    console.log(task);
    // TODO: Open task detail modal
  };

  // Render content based on display mode
  const renderContent = () => {
    if (displayMode === "grid") {
      // Grid view - show user cards
      return (
        <UserCardGrid
          users={users}
          tasks={filteredTasks}
          onUserClick={handleUserClick}
        />
      );
    }

    // List view - depends on view mode
    if (viewMode === "daily") {
      return <TaskListDaily tasks={filteredTasks} users={users} tags={secondaryTags} />;
    }

    if (viewMode === "weekly") {
      const weekStart = getWeekStart(new Date(selectedDate));
      return (
        <TaskListWeekly
          tasks={filteredTasks}
          users={users}
          weekStart={weekStart}
          onTaskClick={handleTaskClick}
        />
      );
    }

    // Monthly - not implemented, show placeholder
    return (
      <div
        className={`
          text-center py-16
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        <p className="text-lg">תצוגה חודשית תתווסף בקרוב</p>
        <p className="text-sm mt-2">בחר תצוגה יומית או שבועית</p>
      </div>
    );
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

      {/* Header with filter, toggle, and create button */}
      <HeaderHomePage
        onCreateTask={handleCreateTask}
        onSearch={handleSearch}
        onViewModeChange={setViewMode}
        onDisplayModeChange={setDisplayMode}
        viewMode={viewMode}
        displayMode={displayMode}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 overflow-y-auto
          ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
          p-4 lg:p-6 xl:p-8
          ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
        `}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default HomePage;
