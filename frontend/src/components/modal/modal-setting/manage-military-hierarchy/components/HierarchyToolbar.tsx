import React from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

interface HierarchyToolbarProps {
  isDarkMode: boolean;
  isAllExpanded: boolean;
  isAllCollapsed: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const HierarchyToolbar: React.FC<HierarchyToolbarProps> = ({
  isDarkMode,
  isAllExpanded,
  isAllCollapsed: _isAllCollapsed, // Kept for API compatibility
  onExpandAll,
  onCollapseAll,
}) => {
  // Toggle handler - expand when collapsed, collapse when expanded
  const handleToggle = () => {
    if (isAllExpanded) {
      onCollapseAll();
    } else {
      onExpandAll();
    }
  };

  const isExpanded = isAllExpanded;
  const Icon = isExpanded ? ChevronUp : ChevronDown;

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
        onClick={handleToggle}
        className={`
          flex items-center gap-2
          px-3 py-2
          rounded-lg
          text-sm font-semibold
          border
          transition-all duration-200
          ${
            isExpanded
              ? `text-blue-500 ${
                  isDarkMode
                    ? "bg-blue-500/15 border-blue-500/30"
                    : "bg-blue-50 border-blue-200"
                } shadow-sm scale-[1.02]`
              : `${isDarkMode ? "text-slate-300" : "text-slate-600"} 
               border-transparent
               ${isDarkMode ? "hover:bg-blue-500/10" : "hover:bg-blue-50/50"}
               hover:text-blue-500`
          }
        `}
      >
        <Layers className={`w-4 h-4 ${isExpanded ? "text-blue-500" : ""}`} />
        <span>{isExpanded ? "קבץ כל היחידות" : "הצג כל היחידה"}</span>
        <Icon className={`w-4 h-4 ${isExpanded ? "text-blue-500" : ""}`} />
      </button>
    </div>
  );
};
