import React from "react";
import { AlertCircle, Clock, CheckCircle, ShieldCheck } from "lucide-react";
import type { TaskStatus } from "../../../api/tasksApi";

/**
 * Status configuration matching Statistics.tsx colors
 * - pending: green (פתוח)
 * - in_progress: amber (בטיפול)
 * - pending_approval: purple (ממתין לאישור)
 * - completed: slate (סגור)
 */
const STATUS_OPTIONS: {
  id: TaskStatus;
  label: string;
  icon: React.ElementType;
  activeColor: string;
  activeBgLight: string;
  activeBgDark: string;
  hoverBgLight: string;
  hoverBgDark: string;
}[] = [
  {
    id: "pending",
    label: "פתוח",
    icon: AlertCircle,
    activeColor: "text-green-500",
    activeBgLight: "bg-green-50 border-green-200",
    activeBgDark: "bg-green-500/15 border-green-500/30",
    hoverBgLight: "hover:bg-green-50/50",
    hoverBgDark: "hover:bg-green-500/10",
  },
  {
    id: "in_progress",
    label: "בטיפול",
    icon: Clock,
    activeColor: "text-amber-500",
    activeBgLight: "bg-amber-50 border-amber-200",
    activeBgDark: "bg-amber-500/15 border-amber-500/30",
    hoverBgLight: "hover:bg-amber-50/50",
    hoverBgDark: "hover:bg-amber-500/10",
  },
  {
    id: "pending_approval",
    label: "ממתין לאישור",
    icon: ShieldCheck,
    activeColor: "text-purple-500",
    activeBgLight: "bg-purple-50 border-purple-200",
    activeBgDark: "bg-purple-500/15 border-purple-500/30",
    hoverBgLight: "hover:bg-purple-50/50",
    hoverBgDark: "hover:bg-purple-500/10",
  },
  {
    id: "completed",
    label: "סגור",
    icon: CheckCircle,
    activeColor: "text-slate-400",
    activeBgLight: "bg-slate-100 border-slate-300",
    activeBgDark: "bg-slate-500/15 border-slate-500/30",
    hoverBgLight: "hover:bg-slate-100/50",
    hoverBgDark: "hover:bg-slate-500/10",
  },
];

interface StatusFilterButtonsProps {
  /** Set of selected statuses (empty = show all) */
  selectedStatuses: Set<TaskStatus>;
  /** Called when selection changes */
  onChange: (statuses: Set<TaskStatus>) => void;
  isDarkMode: boolean;
}

/**
 * StatusFilterButtons - Filter tasks by multiple statuses
 * Colors match the Statistics.tsx component
 * - Click to toggle status selection
 * - Multiple statuses can be selected
 * - Empty selection = show all tasks
 */
const StatusFilterButtons: React.FC<StatusFilterButtonsProps> = ({
  selectedStatuses,
  onChange,
  isDarkMode,
}) => {
  const handleClick = (status: TaskStatus) => {
    const newSet = new Set(selectedStatuses);
    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }
    onChange(newSet);
  };

  return (
    <div
      className={`
        flex items-center gap-1.5 p-1.5 rounded-xl
        ${isDarkMode ? "bg-slate-800/50" : "bg-white/80"}
        border ${isDarkMode ? "border-slate-700" : "border-slate-200"}
        shadow-sm
      `}
    >
      {STATUS_OPTIONS.map((option) => {
        const isSelected = selectedStatuses.has(option.id);
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            onClick={() => handleClick(option.id)}
            className={`
              flex items-center gap-1.5
              px-3 py-1.5
              rounded-lg
              text-xs font-semibold
              border
              transition-all duration-200
              ${
                isSelected
                  ? `${option.activeColor} ${
                      isDarkMode ? option.activeBgDark : option.activeBgLight
                    } shadow-sm scale-[1.02]`
                  : `${isDarkMode ? "text-slate-400" : "text-slate-500"} 
                     border-transparent
                     ${isDarkMode ? option.hoverBgDark : option.hoverBgLight}
                     hover:text-slate-${isDarkMode ? "200" : "700"}`
              }
            `}
          >
            <Icon
              className={`w-3.5 h-3.5 ${isSelected ? option.activeColor : ""}`}
            />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilterButtons;
