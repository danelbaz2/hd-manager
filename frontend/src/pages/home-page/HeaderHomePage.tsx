import React, { useState } from "react";
import {
  Plus,
  Calendar,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  AlignJustify,
  Tags,
  Search,
} from "lucide-react";
import { useTheme, useAuth } from "../../contexts";

type ViewMode = "daily" | "weekly" | "monthly";
type DisplayMode = "grid" | "list" | "tags";

const VIEW_MODES = [
  { id: "daily" as ViewMode, label: "יומי", icon: Calendar },
  { id: "weekly" as ViewMode, label: "שבועי", icon: CalendarDays },
  { id: "monthly" as ViewMode, label: "חודשי", icon: CalendarRange },
];

interface HeaderHomePageProps {
  onCreateTask?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onDisplayModeChange?: (mode: DisplayMode) => void;
  onSearchChange?: (query: string) => void;
  viewMode?: ViewMode;
  displayMode?: DisplayMode;
}

const HeaderHomePage: React.FC<HeaderHomePageProps> = ({
  onCreateTask,
  onViewModeChange,
  onDisplayModeChange,
  onSearchChange,
  viewMode: externalViewMode,
  displayMode: externalDisplayMode,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Use external state if provided, otherwise use internal
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("daily");
  const [internalDisplayMode, setInternalDisplayMode] =
    useState<DisplayMode>("grid");
  const viewMode = externalViewMode ?? internalViewMode;
  const displayMode = externalDisplayMode ?? internalDisplayMode;

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Handle display mode change
  const handleDisplayModeChange = (mode: DisplayMode) => {
    setInternalDisplayMode(mode);
    onDisplayModeChange?.(mode);
  };

  return (
    <div
      className={`
        flex items-center justify-between
        px-4 lg:px-6 xl:px-8
        py-3 lg:py-4
        border-b
        ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-slate-50 border-slate-200"
        }
      `}
      dir="rtl"
    >
      {/* Right Side - Display Toggle & Filter Panel */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Display Mode Toggle (Grid/List) */}
        <div
          className={`
            flex items-center p-1 rounded-xl border
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200 shadow-sm"
            }
          `}
        >
          <button
            onClick={() => handleDisplayModeChange("list")}
            className={`
              p-1.5 lg:p-2 rounded-lg transition-all duration-200
              ${
                displayMode === "list"
                  ? isDarkMode
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-500 text-white shadow-md"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }
            `}
            title="תצוגת רשימה"
          >
            <AlignJustify className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() => handleDisplayModeChange("grid")}
            className={`
              p-1.5 lg:p-2 rounded-lg transition-all duration-200
              ${
                displayMode === "grid"
                  ? isDarkMode
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-500 text-white shadow-md"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }
            `}
            title="תצוגת כרטיסים"
          >
            <LayoutGrid className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() => handleDisplayModeChange("tags")}
            className={`
              p-1.5 lg:p-2 rounded-lg transition-all duration-200
              ${
                displayMode === "tags"
                  ? isDarkMode
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-500 text-white shadow-md"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }
            `}
            title="תצוגת תגיות"
          >
            <Tags className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>

        {/* Tag Search - Only show in tags mode */}
        {displayMode === "tags" && (
          <div className="relative">
            <input
              type="text"
              placeholder="חיפוש לפי תגית..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={`
                w-48 lg:w-64
                pl-10 pr-4 py-2 lg:py-2.5
                rounded-xl border
                text-sm
                transition-all duration-200
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 shadow-sm"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}
            />
          </div>
        )}
      </div>

      {/* Left Side - View Mode Toggle & Create Button */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* View Mode Toggle (Daily/Weekly/Monthly) */}
        <div
          className={`
            flex items-center p-1 rounded-xl border
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200 shadow-sm"
            }
          `}
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleViewModeChange(mode.id)}
              className={`
                flex items-center gap-1.5 lg:gap-2
                px-3 lg:px-4 py-1.5 lg:py-2
                rounded-lg
                text-xs lg:text-sm font-medium
                transition-all duration-200
                ${
                  viewMode === mode.id
                    ? isDarkMode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-blue-500 text-white shadow-md"
                    : isDarkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              <mode.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Create Task Button - Only visible for admin users */}
        {isAdmin && (
          <button
            onClick={onCreateTask}
            className="
              flex items-center gap-1.5 lg:gap-2
              px-4 lg:px-5 xl:px-6
              py-2 lg:py-2.5
              rounded-xl
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              text-white font-medium
              text-sm lg:text-base
              transition-all duration-200
              shadow-lg hover:shadow-xl
              hover:scale-[1.02]
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
