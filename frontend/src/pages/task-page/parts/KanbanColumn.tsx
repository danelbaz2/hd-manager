import React from "react";
import { CheckCircle2, Clock, AlertCircle, type LucideIcon } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanTaskCard from "./KanbanTaskCard";

// type TaskStatus definition removed as it is imported

interface KanbanColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    users: UserData[];
    icon: LucideIcon;
    colorClass: string;
    onDrop: (e: React.DragEvent, targetStatus: TaskStatus) => void;
    onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    status,
    tasks,
    users,
    icon: Icon,
    colorClass,
    onDrop,
    onTaskClick,
}) => {
    const { isDarkMode } = useTheme();

    // Handle drag over - must call preventDefault to allow drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Handle drop - get task ID and call onDrop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, status);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`
        flex-1 min-w-[300px] md:min-w-0
        rounded-2xl p-4
        flex flex-col h-full
        border transition-colors
        ${isDarkMode
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }
      `}
        >
            {/* Column Header */}
            <div
                className={`
          flex items-center justify-between
          mb-4 pb-3 border-b
          ${isDarkMode ? "border-slate-700" : "border-slate-200"}
        `}
            >
                <div className="flex items-center gap-2">
                    <div
                        className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}
            `}
                    >
                        <span
                            className={`
                text-xs font-bold
                ${isDarkMode ? "text-slate-300" : "text-slate-600"}
              `}
                        >
                            {tasks.length}
                        </span>
                    </div>
                    <h3 className={`font-bold text-lg ${colorClass}`}>{title}</h3>
                </div>
                <Icon size={18} className={colorClass} />
            </div>

            {/* Tasks Container */}
            <div className={`flex-1 overflow-y-auto p-1 ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}>
                {tasks.length === 0 ? (
                    <div
                        className={`
              flex items-center justify-center h-32
              text-sm
              ${isDarkMode ? "text-slate-600" : "text-slate-300"}
            `}
                    >
                        אין משימות
                    </div>
                ) : (
                    tasks.map((task) => (
                        <KanbanTaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            onClick={onTaskClick}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Column configuration for reuse
export const KANBAN_COLUMNS: Array<{
    status: TaskStatus;
    title: string;
    icon: LucideIcon;
    colorClass: string;
}> = [
        {
            status: "pending",
            title: "פתוח",
            icon: AlertCircle,
            colorClass: "text-emerald-500",
        },
        {
            status: "in_progress",
            title: "בטיפול",
            icon: Clock,
            colorClass: "text-amber-500",
        },
        {
            status: "completed",
            title: "סגור",
            icon: CheckCircle2,
            colorClass: "text-slate-400",
        },
    ];

export default KanbanColumn;
export type { TaskStatus };
