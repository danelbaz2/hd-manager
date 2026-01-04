import React from "react";
import { ListTodo, UserX } from "lucide-react";

type ResponsibleFilter = "all" | "without";

interface ResponsibleFilterButtonProps {
  /** Current filter selection */
  selectedFilter: ResponsibleFilter;
  /** Called when selection changes */
  onChange: (filter: ResponsibleFilter) => void;
  isDarkMode: boolean;
}

/**
 * ResponsibleFilterButton - Single toggle button to filter unassigned tasks
 * Matches StatusFilterButtons design exactly
 * - Default: "כל המשימות" (all tasks)
 * - Click to toggle: "משימות ללא הקצאה" (unassigned tasks)
 */
const ResponsibleFilterButton: React.FC<ResponsibleFilterButtonProps> = ({
  selectedFilter,
  onChange,
  isDarkMode,
}) => {
  const handleClick = () => {
    // Toggle between "all" and "without"
    onChange(selectedFilter === "all" ? "without" : "all");
  };

  const isShowingUnassigned = selectedFilter === "without";
  const Icon = isShowingUnassigned ? UserX : ListTodo;

  return (
    <div
      className={`
                flex items-center gap-1.5 p-1.5 rounded-xl
                ${isDarkMode ? "bg-slate-800/50" : "bg-white/80"}
                border ${isDarkMode ? "border-slate-700" : "border-slate-200"}
                shadow-sm
            `}
    >
      <button
        onClick={handleClick}
        className={`
                    flex items-center gap-1.5
                    px-3 py-1.5
                    rounded-lg
                    text-xs font-semibold
                    border
                    transition-all duration-200
                    ${
                      isShowingUnassigned
                        ? `text-orange-500 ${
                            isDarkMode
                              ? "bg-orange-500/15 border-orange-500/30"
                              : "bg-orange-50 border-orange-200"
                          } shadow-sm scale-[1.02]`
                        : `${isDarkMode ? "text-slate-400" : "text-slate-500"} 
                           border-transparent
                           ${
                             isDarkMode
                               ? "hover:bg-orange-500/10"
                               : "hover:bg-orange-50/50"
                           }
                           hover:text-slate-${isDarkMode ? "200" : "700"}`
                    }
                `}
      >
        <Icon
          className={`w-3.5 h-3.5 ${
            isShowingUnassigned ? "text-orange-500" : ""
          }`}
        />
        <span>{isShowingUnassigned ? "משימות ללא הקצאה" : "כל המשימות"}</span>
      </button>
    </div>
  );
};

export default ResponsibleFilterButton;
