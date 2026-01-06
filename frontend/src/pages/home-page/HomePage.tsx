import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { useTheme, useViewState, useAuth } from "../../contexts";
import {
  useTasksQuery,
  useUsersQuery,
  usePrimaryTagsQuery,
  useSecondaryTagsQuery,
  useAllTasksHistoryQuery,
} from "../../api/queries";
import {
  mapUsersToUserData,
  mapPrimaryTagsToData,
  mapSecondaryTagsToData,
} from "../../api/typeMappers";
import HeaderHomePage from "./HeaderHomePage";
import NewTaskModal from "../../components/modal/modal-new-task";
import { GridView } from "./grid-view";
import { ListView } from "./list-view";
import { TagsView } from "./tags-view";
import { filterTasksByDateRange } from "./shared";
import { useTaskModal } from "../../components/modal/modal-task";
import { type Task, type TaskStatus } from "../../api/tasksApi";
import { useTour } from "../../components/demos/tour-provider";
import { PageHelpButton } from "../../components/demos/page-help-button";
import {
  DEMO_TASKS,
  DEMO_USERS,
  DEMO_HISTORY,
  DEMO_PRIMARY_TAGS,
  DEMO_SECONDARY_TAGS,
  DEMO_TEAM_UPDATES,
} from "../../components/demos/shared/tourData";
import type { UserData } from "../../schemas/userTypes";

const HomePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  /* Demos */
  const {
    checkAndStartTour,
    startTour,
    state: tourState,
    isFirstTimeUser,
  } = useTour();
  const isTourActive = tourState.isActive && tourState.currentPageId === "home";

  // Check if this is a first-time user - show demo data immediately
  const showDemoData = isTourActive || isFirstTimeUser();

  // React Query - Real Data (cached, deduplicated)
  const { data: tasksData = [] } = useTasksQuery();
  const { data: usersData = [] } = useUsersQuery();
  const { data: primaryTagsData = [] } = usePrimaryTagsQuery();
  const { data: secondaryTagsData = [] } = useSecondaryTagsQuery();
  const { data: historyData = [] } = useAllTasksHistoryQuery();

  // Map API types to frontend schema types (memoized for performance)
  const realTasks = tasksData; // Tasks already match the expected type
  const realUsers = useMemo(() => mapUsersToUserData(usersData), [usersData]);
  const realPrimaryTags = useMemo(() => mapPrimaryTagsToData(primaryTagsData), [primaryTagsData]);
  const realSecondaryTags = useMemo(() => mapSecondaryTagsToData(secondaryTagsData), [secondaryTagsData]);
  const realHistory = historyData;

  // Merge real and demo data for the tour OR first-time users
  const { tasks, users, primaryTags, secondaryTags, teamUpdates } =
    useMemo(() => {
      if (showDemoData) {
        // Augment demo data to include current user with tasks
        const effectiveUsers = user
          ? [
            user as any as UserData,
            ...DEMO_USERS.filter((u) => u.id !== user.id),
          ]
          : DEMO_USERS;

        const myDemoTasks = user
          ? DEMO_TASKS.map((t) => ({
            ...t,
            id: `my-${t.id}`,
            responsibleUserIds: [user.id],
          }))
          : [];

        const demoTeamUpdates = DEMO_TEAM_UPDATES.map((u) => ({
          id: u.id,
          content: u.message,
          senderId: u.senderId,
          base: { createdAt: u.timestamp },
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
    }, [
      showDemoData,
      user,
      realTasks,
      realUsers,
      realHistory,
      realPrimaryTags,
      realSecondaryTags,
    ]);

  const { viewMode, setViewMode, displayMode, setDisplayMode, selectedDate } =
    useViewState();
  const { openTaskModal } = useTaskModal();
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Trigger tour on first visit - start immediately for first-time users
  useEffect(() => {
    if (user) {
      if (isFirstTimeUser()) {
        // Start tour immediately for first-time users (no delay)
        startTour("home");
      } else {
        // For returning users, use the normal check
        checkAndStartTour("home", user.role === "admin");
      }
    }
  }, [user, isFirstTimeUser, startTour, checkAndStartTour]);

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

  // Status filter state (empty Set = show all)
  const [statusFilter, setStatusFilter] = useState<Set<TaskStatus>>(new Set());

  // Responsible filter state ("all" | "without")
  const [responsibleFilter, setResponsibleFilter] = useState<"all" | "without">(
    "all"
  );

  // Filter tasks based on current view (date range only)
  // Exception: In list mode with responsible filter, show ALL tasks matching the filter
  const filteredTasks = useMemo(() => {
    if (displayMode === "list" && responsibleFilter === "without") {
      // Show all unassigned tasks across all dates
      return tasks.filter(
        (task) =>
          !task.responsibleUserIds || task.responsibleUserIds.length === 0
      );
    }
    // Normal date-based filtering
    return filterTasksByDateRange(tasks, selectedDate, viewMode);
  }, [tasks, selectedDate, viewMode, displayMode, responsibleFilter]);

  // Handlers
  const handleCreateTask = () => setIsNewTaskModalOpen(true);

  // Task created callback - React Query auto-invalidates via mutation onSuccess
  // No manual refresh needed; WebSocket integration also triggers invalidation
  const handleTaskCreated = useCallback(() => {
    // React Query handles cache invalidation automatically
    // This callback is kept for any future side effects if needed
  }, []);

  const handleSearchChange = (query: string) => setSearchQuery(query);
  const handleStatusFilterChange = (statuses: Set<TaskStatus>) =>
    setStatusFilter(statuses);
  const handleResponsibleFilterChange = (filter: "all" | "without") => {
    setResponsibleFilter(filter);
    // Clear status filter when changing responsible filter for cleaner UX
    if (filter !== responsibleFilter) {
      setStatusFilter(new Set());
    }
  };

  // Handle clicking on status summary in Grid View
  const handleStatusSummaryClick = (status: TaskStatus) => {
    setDisplayMode("list");
    setStatusFilter(new Set([status]));
    setResponsibleFilter("all"); // Clear responsible filter when clicking status
  };

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
          <GridView
            users={users}
            tasks={filteredTasks}
            viewMode={viewMode}
            teamUpdatesOverride={teamUpdates}
            onStatusSummaryClick={handleStatusSummaryClick}
          />
        );

      case "list":
        return (
          <ListView
            tasks={filteredTasks}
            users={users}
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        );

      case "tags":
        return (
          <TagsView
            tasks={filteredTasks}
            users={users}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onTaskClick={handleTaskClick}
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
          />
        );

      default:
        return (
          <GridView
            users={users}
            tasks={filteredTasks}
            viewMode={viewMode}
            teamUpdatesOverride={teamUpdates}
            onStatusSummaryClick={handleStatusSummaryClick}
          />
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
            onStatusFilterChange={handleStatusFilterChange}
            onResponsibleFilterChange={handleResponsibleFilterChange}
            viewMode={viewMode}
            displayMode={displayMode}
            statusFilter={statusFilter}
            responsibleFilter={responsibleFilter}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={mainScrollRef}
        data-tour="main-content-area"
        className={`flex-1 min-h-0 overflow-y-auto p-2 md:p-3 lg:p-4 ${isDarkMode
          ? "bg-slate-900 dark-scrollbar"
          : "bg-slate-50 light-scrollbar"
          }`}
      >
        {renderContent()}
      </div>

      {/* Floating Help Button */}
      <PageHelpButton title="הצג הדרכה" pageId="home" />
    </div>
  );
};

export default HomePage;
