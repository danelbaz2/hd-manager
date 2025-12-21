import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, type LucideIcon } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanTaskCard from "./KanbanTaskCard";

interface KanbanColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    users: UserData[];
    icon: LucideIcon;
    colorClass: string;
    onDrop: (taskId: string, targetStatus: TaskStatus) => void;
    onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
    onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    status,
    tasks,
    users,
    icon: Icon,
    colorClass,
    onTaskStatusChange,
    onTaskClick,
}) => {
    const { isDarkMode } = useTheme();
    const [isDropTarget, setIsDropTarget] = useState(false);
    const columnRef = useRef<HTMLDivElement>(null);

    // Detect when dragging over this column
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const draggingTaskId = document.body.getAttribute("data-dragging-task");
            if (!draggingTaskId || !columnRef.current) {
                setIsDropTarget(false);
                return;
            }

            const rect = columnRef.current.getBoundingClientRect();
            const isOver =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            setIsDropTarget(isOver);
        };

        const handleMouseUp = () => {
            setIsDropTarget(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={columnRef}
            data-column-status={status}
            className={`
                flex-1 min-w-[300px] md:min-w-0
                rounded-2xl p-4
                flex flex-col h-full
                border transition-all duration-300 ease-out
                ${isDropTarget
                    ? isDarkMode
                        ? "bg-blue-900/20 border-blue-500/60 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50/80 border-blue-400/60 shadow-lg shadow-blue-500/10"
                    : isDarkMode
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
                            transition-colors duration-300
                            ${isDropTarget
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                    ? "bg-slate-700"
                                    : "bg-slate-200"
                            }
                        `}
                    >
                        <span
                            className={`
                                text-xs font-bold
                                ${isDropTarget
                                    ? "text-white"
                                    : isDarkMode
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                }
                            `}
                        >
                            {tasks.length}
                        </span>
                    </div>
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${isDropTarget ? "text-blue-500" : colorClass}`}>
                        {title}
                    </h3>
                </div>
                <Icon size={18} className={`transition-colors duration-300 ${isDropTarget ? "text-blue-500" : colorClass}`} />
            </div>

            {/* Tasks Container */}
            <div
                className={`
                    flex-1 overflow-y-auto p-1 rounded-lg relative
                    transition-colors duration-300
                    ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
                    ${isDropTarget ? "bg-blue-500/5" : ""}
                `}
            >
                {/* Empty state placeholder */}
                {tasks.length === 0 && (
                    <div
                        className={`
                            flex items-center justify-center h-32
                            text-sm rounded-lg
                            transition-all duration-300
                            ${isDropTarget
                                ? isDarkMode
                                    ? "text-blue-400 bg-blue-500/10 border-2 border-dashed border-blue-500/30"
                                    : "text-blue-500 bg-blue-50 border-2 border-dashed border-blue-400/40"
                                : isDarkMode
                                    ? "text-slate-600"
                                    : "text-slate-300"
                            }
                        `}
                    >
                        {isDropTarget ? "שחרר כאן" : "אין משימות"}
                    </div>
                )}

                {/* Task cards */}
                {tasks.map((task) => (
                    <KanbanTaskCard
                        key={task.id}
                        task={task}
                        users={users}
                        onClick={onTaskClick}
                        columnStatus={status}
                        onTaskStatusChange={onTaskStatusChange}
                    />
                ))}
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
