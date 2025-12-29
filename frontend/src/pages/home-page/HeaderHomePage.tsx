import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  AlignJustify,
  Tags,
} from "lucide-react";
import { useTheme, useAuth } from "../../contexts";
import { IconToggleButton, IconButtonToggle, SearchInput, StatusFilterButtons } from "./components";
import type { TaskStatus } from "../../api/tasksApi";

type ViewMode = "daily" | "weekly" | "monthly";
type DisplayMode = "grid" | "list" | "tags";

const VIEW_MODE_OPTIONS = [
  { id: "daily" as ViewMode, label: "יומי", icon: Calendar },
  { id: "weekly" as ViewMode, label: "שבועי", icon: CalendarDays },
  { id: "monthly" as ViewMode, label: "חודשי", icon: CalendarRange },
];

const DISPLAY_MODE_OPTIONS = [
  { id: "grid" as DisplayMode, icon: LayoutGrid, title: "תצוגת כרטיסים" },
  { id: "list" as DisplayMode, icon: AlignJustify, title: "תצוגת רשימה" },
  { id: "tags" as DisplayMode, icon: Tags, title: "תצוגת תגיות" },
];

interface HeaderHomePageProps {
  onCreateTask?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onDisplayModeChange?: (mode: DisplayMode) => void;
  onSearchChange?: (query: string) => void;
  onStatusFilterChange?: (statuses: Set<TaskStatus>) => void;
  viewMode?: ViewMode;
  displayMode?: DisplayMode;
  statusFilter?: Set<TaskStatus>;
}

/**
 * HeaderHomePage - Page header with view/display mode toggles and search
 * Refactored to use shared toggle and search components
 */
const HeaderHomePage: React.FC<HeaderHomePageProps> = ({
  onCreateTask,
  onViewModeChange,
  onDisplayModeChange,
  onSearchChange,
  onStatusFilterChange,
  viewMode: externalViewMode,
  displayMode: externalDisplayMode,
  statusFilter: externalStatusFilter,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("daily");
  const [internalDisplayMode, setInternalDisplayMode] =
    useState<DisplayMode>("grid");
  const [internalStatusFilter, setInternalStatusFilter] = useState<Set<TaskStatus>>(new Set());

  const viewMode = externalViewMode ?? internalViewMode;
  const displayMode = externalDisplayMode ?? internalDisplayMode;
  const statusFilter = externalStatusFilter ?? internalStatusFilter;

  const handleViewModeChange = (mode: ViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setInternalDisplayMode(mode);
    onDisplayModeChange?.(mode);
  };

  const handleStatusFilterChange = (statuses: Set<TaskStatus>) => {
    setInternalStatusFilter(statuses);
    onStatusFilterChange?.(statuses);
  };

  // Listen for tour events to change display/view modes
  useEffect(() => {
    const handleSetDisplayMode = (e: CustomEvent<DisplayMode>) => {
      handleDisplayModeChange(e.detail);
    };
    const handleSetViewMode = (e: CustomEvent<ViewMode>) => {
      handleViewModeChange(e.detail);
    };

    window.addEventListener(
      "tour:set-display-mode",
      handleSetDisplayMode as EventListener
    );
    window.addEventListener(
      "tour:set-view-mode",
      handleSetViewMode as EventListener
    );

    return () => {
      window.removeEventListener(
        "tour:set-display-mode",
        handleSetDisplayMode as EventListener
      );
      window.removeEventListener(
        "tour:set-view-mode",
        handleSetViewMode as EventListener
      );
    };
  }, []);

  return (
    <div
      data-tour="header-bar"
      className={`
        flex items-center justify-between
        px-4 lg:px-6 xl:px-8 py-3 lg:py-4 
        ${isDarkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-slate-50 border-slate-200"
        }
      `}
      dir="rtl"
    >
      {/* Right Side - Display Toggle & Search & Status Filter */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div data-tour="display-modes">
          <IconButtonToggle
            options={DISPLAY_MODE_OPTIONS}
            selected={displayMode}
            isDarkMode={isDarkMode}
            onChange={handleDisplayModeChange}
          />
        </div>

        {(displayMode === "tags" || displayMode === "list") && onSearchChange && (
          <SearchInput
            placeholder={
              displayMode === "tags" ? "חיפוש לפי תגית..." : "חיפוש משימה..."
            }
            isDarkMode={isDarkMode}
            onChange={onSearchChange}
          />
        )}

        {/* Status Filter - Show in list and tags modes */}
        {(displayMode === "list" || displayMode === "tags") && (
          <StatusFilterButtons
            selectedStatuses={statusFilter}
            onChange={handleStatusFilterChange}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Left Side - View Mode Toggle & Create Button */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div data-tour="view-modes">
          <IconToggleButton
            options={VIEW_MODE_OPTIONS}
            selected={viewMode}
            isDarkMode={isDarkMode}
            onChange={handleViewModeChange}
          />
        </div>
        {isAdmin && (
          <button
            onClick={onCreateTask}
            data-tour="create-task"
            className="
              flex items-center gap-1.5 lg:gap-2
              px-4 lg:px-5 xl:px-6 py-2 lg:py-2.5
              rounded-xl
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              text-white font-medium text-sm lg:text-base
              transition-all duration-200
              shadow-lg hover:shadow-xl hover:scale-[1.02]
            "
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>יצירת משימה</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderHomePage;
