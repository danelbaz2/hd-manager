import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useSettings, useViewState, useAuth } from "../../contexts";
import HeaderHomePage from "./HeaderHomePage";
import NewTaskModal from "../../components/modal/modal-new-task";
import { GridView } from "./grid-view";
import { ListView } from "./list-view";
import { TagsView } from "./tags-view";
import { filterTasksByDateRange } from "./shared";
import { useTaskModal } from "../../components/modal/modal-task";
import { type Task } from "../../api/tasksApi";
import { useTour } from "../../components/demos/tour-provider";
import { PageHelpButton } from "../../components/demos/page-help-button";
import { DEMO_TASKS, DEMO_USERS, DEMO_HISTORY, DEMO_PRIMARY_TAGS, DEMO_SECONDARY_TAGS, DEMO_TEAM_UPDATES } from "../../components/demos/shared/tourData";
import type { UserData } from "../../schemas/userTypes";

const HomePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  /* Demos */
  const { checkAndStartTour, state: tourState } = useTour();
  const isTourActive = tourState.isActive && tourState.currentPageId === "home";

  // Real Data
  const {
    tasks: realTasks,
    users: realUsers,
    primaryTags: realPrimaryTags,
    secondaryTags: realSecondaryTags,
    refreshTasks,
    refreshTaskHistory,
    taskHistory: realHistory
  } = useSettings();

  // Merge real and demo data for the tour
  const {
    tasks,
    users,
    primaryTags,
    secondaryTags,
    teamUpdates,
  } = useMemo(() => {
    if (isTourActive) {
      // Augment demo data to include current user with tasks
      const effectiveUsers = user ? [user as any as UserData, ...DEMO_USERS.filter(u => u.id !== user.id)] : DEMO_USERS;

      const myDemoTasks = user
        ? DEMO_TASKS.map(t => ({
          ...t,
          id: `my-${t.id}`,
          responsibleUserIds: [user.id]
        }))
        : [];

      const demoTeamUpdates = DEMO_TEAM_UPDATES.map(u => ({
        id: u.id,
        content: u.message,
        senderId: u.senderId,
        base: { createdAt: u.timestamp }
      }));

      return {
        tasks: [...DEMO_TASKS, ...myDemoTasks],
        users: effectiveUsers,
        formattedHistory: [...DEMO_HISTORY],
        primaryTags: [...realPrimaryTags, ...DEMO_PRIMARY_TAGS],
        secondaryTags: [...realSecondaryTags, ...DEMO_SECONDARY_TAGS],
        teamUpdates: demoTeamUpdates,
      };
    }
    return {
      tasks: realTasks,
      users: realUsers,
      formattedHistory: realHistory,
      primaryTags: realPrimaryTags,
      secondaryTags: realSecondaryTags,
      teamUpdates: undefined,
    };
  }, [isTourActive, user, realTasks, realUsers, realHistory, realPrimaryTags, realSecondaryTags]);

  const { viewMode, setViewMode, displayMode, setDisplayMode, selectedDate } =
    useViewState();
  const { openTaskModal } = useTaskModal();

  // Trigger tour on first visit
  useEffect(() => {
    if (user) {
      checkAndStartTour("home", user.role === "admin");
    }
  }, [user, checkAndStartTour]);

  // Handle navigation state from menu
  useEffect(() => {
    const state = location.state as {
      displayMode?: string;
      viewMode?: string;
    } | null;
    if (state?.displayMode === "grid") {
      setDisplayMode("grid");
    }
    if (state?.viewMode === "daily") {
      setViewMode("daily");
    }
  }, [location.state, setDisplayMode, setViewMode]);

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
          <GridView users={users} tasks={filteredTasks} viewMode={viewMode} teamUpdatesOverride={teamUpdates} />
        );

      case "list":
        return (
          <ListView
            tasks={filteredTasks}
            users={users}
            tags={secondaryTags}
            searchQuery={searchQuery}
          />
        );

      case "tags":
        return (
          <TagsView
            tasks={filteredTasks}
            users={users}
            searchQuery={searchQuery}
            onTaskClick={handleTaskClick}
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
          />
        );


      default:
        return (
          <GridView users={users} tasks={filteredTasks} viewMode={viewMode} teamUpdatesOverride={teamUpdates} />
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

      {/* Header with Help Button */}
      <div className="flex items-center" dir="rtl">
        <div className="flex-1">
          <HeaderHomePage
            onCreateTask={handleCreateTask}
            onViewModeChange={setViewMode}
            onDisplayModeChange={setDisplayMode}
            onSearchChange={handleSearchChange}
            viewMode={viewMode}
            displayMode={displayMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        data-tour="main-content-area"
        className={`flex-1 overflow-y-auto p-4 lg:p-4 xl:p-2
          ${isDarkMode
            ? "bg-slate-900 dark-scrollbar"
            : "bg-slate-50 light-scrollbar"
          }`}
      >
        {renderContent()}
      </div>

      {/* Floating Help Button */}
      <PageHelpButton
        title="הצג הדרכה"
        pageId="home" />
    </div>
  );
};

export default HomePage;

