import React from "react";
import { Circle, Clock, CheckCircle2 } from "lucide-react";
import type { TaskStatus } from "../../../api/tasksApi";

// Status configuration with colors and labels (no 'all' or 'cancelled')
const STATUS_OPTIONS: {
    id: TaskStatus;
    label: string;
    icon: React.ElementType;
    activeColor: string;
    activeBg: string;
}[] = [
        {
            id: "pending",
            label: "פתוח",
            icon: Circle,
            activeColor: "text-amber-600",
            activeBg: "bg-amber-100 dark:bg-amber-900/40",
        },
        {
            id: "in_progress",
            label: "בטיפול",
            icon: Clock,
            activeColor: "text-blue-600",
            activeBg: "bg-blue-100 dark:bg-blue-900/40",
        },
        {
            id: "completed",
            label: "סגור",
            icon: CheckCircle2,
            activeColor: "text-green-600",
            activeBg: "bg-green-100 dark:bg-green-900/40",
        },
    ];

interface StatusFilterButtonsProps {
    selectedStatus: TaskStatus | null; // null means show all
    onChange: (status: TaskStatus | null) => void;
    isDarkMode: boolean;
}

/**
 * StatusFilterButtons - Filter tasks by status
 * Shows clickable buttons for each status with color indication
 * Click again to deselect (toggle behavior)
 * When nothing is selected, all tasks are shown
 */
const StatusFilterButtons: React.FC<StatusFilterButtonsProps> = ({
    selectedStatus,
    onChange,
    isDarkMode,
}) => {
    const handleClick = (status: TaskStatus) => {
        // Toggle: if already selected, deselect (show all)
        if (selectedStatus === status) {
            onChange(null);
        } else {
            onChange(status);
        }
    };

    return (
        <div
            className={`
        flex items-center gap-1 p-1 rounded-lg
        ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
      `}
        >
            {STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatus === option.id;
                const Icon = option.icon;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleClick(option.id)}
                        className={`
              flex items-center gap-1.5
              px-3 py-1.5
              rounded-md
              text-xs font-medium
              transition-all duration-200
              ${isSelected
                                ? `${option.activeBg} ${option.activeColor} shadow-sm`
                                : isDarkMode
                                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                            }
            `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default StatusFilterButtons;
