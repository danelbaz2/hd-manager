import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  AlignJustify,
} from "lucide-react";
import { useTheme } from "../../contexts";

type ViewMode = "daily" | "weekly" | "monthly";
type DisplayMode = "grid" | "list";
type FilterType = "free" | "title" | "status" | "tag";

interface FilterOption {
  id: FilterType;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: "free", label: "חיפוש חופשי" },
  { id: "title", label: "כותרת משימה" },
  { id: "status", label: "סטטוס" },
  { id: "tag", label: "תגית" },
];

const VIEW_MODES = [
  { id: "daily" as ViewMode, label: "יומי", icon: Calendar },
  { id: "weekly" as ViewMode, label: "שבועי", icon: CalendarDays },
  { id: "monthly" as ViewMode, label: "חודשי", icon: CalendarRange },
];

interface HeaderHomePageProps {
  onCreateTask?: () => void;
  onSearch?: (query: string, filterType: FilterType) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onDisplayModeChange?: (mode: DisplayMode) => void;
  onDateChange?: (timestamp: number) => void;
  viewMode?: ViewMode;
  displayMode?: DisplayMode;
  selectedDate?: number;
}

const HeaderHomePage: React.FC<HeaderHomePageProps> = ({
  onCreateTask,
  onSearch,
  onViewModeChange,
  onDisplayModeChange,
  viewMode: externalViewMode,
  displayMode: externalDisplayMode,
}) => {
  const { isDarkMode } = useTheme();

  // Use external state if provided, otherwise use internal
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("daily");
  const [internalDisplayMode, setInternalDisplayMode] = useState<DisplayMode>("grid");
  const viewMode = externalViewMode ?? internalViewMode;
  const displayMode = externalDisplayMode ?? internalDisplayMode;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("free");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query, filterType);
  };

  // Handle filter selection
  const handleFilterSelect = (filter: FilterType) => {
    setFilterType(filter);
    setIsFilterOpen(false);
    onSearch?.(searchQuery, filter);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const currentFilter = FILTER_OPTIONS.find((f) => f.id === filterType);

  return (
    <div
      className={`
        flex items-center justify-between
        px-4 lg:px-6 xl:px-8
        py-3 lg:py-4
        ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
      `}
      dir="rtl"
    >
      {/* Right Side - Display Toggle, Filter & Search */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Display Mode Toggle (Grid/List) - Moved here next to filter */}
        <div
          className={`
            flex items-center p-1 rounded-lg border
            ${isDarkMode
              ? "bg-slate-700 border-slate-600"
              : "bg-white border-slate-200"
            }
          `}
        >
          <button
            onClick={() => handleDisplayModeChange("list")}
            className={`
              p-1.5 lg:p-2 rounded-md transition-all
              ${displayMode === "list"
                ? isDarkMode
                  ? "bg-slate-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-600"
                : isDarkMode
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
            title="תצוגת רשימה"
          >
            <AlignJustify className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={() => handleDisplayModeChange("grid")}
            className={`
              p-1.5 lg:p-2 rounded-md transition-all
              ${displayMode === "grid"
                ? isDarkMode
                  ? "bg-slate-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-600"
                : isDarkMode
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
            title="תצוגת כרטיסים"
          >
            <LayoutGrid className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center gap-2
              px-3 lg:px-4 py-2 lg:py-2.5
              rounded-lg border
              text-sm lg:text-base font-medium
              transition-colors
              ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }
            `}
          >
            <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>{currentFilter?.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div
              className={`
                absolute top-full mt-2 right-0 z-20
                min-w-[160px] lg:min-w-[180px]
                py-2 rounded-lg border shadow-lg
                ${isDarkMode
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-200"
                }
              `}
            >
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterSelect(option.id)}
                  className={`
                    w-full text-right
                    px-4 py-2 lg:py-2.5
                    text-sm lg:text-base
                    transition-colors
                    ${filterType === option.id
                      ? isDarkMode
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : isDarkMode
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="חיפוש..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`
              w-48 lg:w-64 xl:w-80
              pl-10 pr-4 py-2 lg:py-2.5
              rounded-lg border
              text-sm lg:text-base
              transition-colors
              ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
          />
          <Search
            className={`
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 lg:w-5 lg:h-5
              ${isDarkMode ? "text-slate-400" : "text-slate-400"}
            `}
          />
        </div>
      </div>

      {/* Left Side - View Mode Toggle & Create Button */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* View Mode Toggle (Daily/Weekly/Monthly) */}
        <div
          className={`
            flex items-center p-1 rounded-lg
            ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
          `}
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleViewModeChange(mode.id)}
              className={`
                flex items-center gap-1.5 lg:gap-2
                px-3 lg:px-4 py-1.5 lg:py-2
                rounded-md
                text-xs lg:text-sm font-medium
                transition-all duration-200
                ${viewMode === mode.id
                  ? isDarkMode
                    ? "bg-slate-600 text-white shadow-sm"
                    : "bg-white text-blue-600 shadow-sm"
                  : isDarkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              <mode.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Create Task Button */}
        <button
          onClick={onCreateTask}
          className="
            flex items-center gap-1.5 lg:gap-2
            px-4 lg:px-5 xl:px-6
            py-2 lg:py-2.5
            rounded-lg
            bg-blue-500 hover:bg-blue-600
            text-white font-medium
            text-sm lg:text-base
            transition-colors
            shadow-sm hover:shadow-md
          "
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>יצירת משימה</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderHomePage;
