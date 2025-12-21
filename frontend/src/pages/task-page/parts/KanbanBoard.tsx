import React, { useMemo } from "react";
import { useTheme } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanColumn, { KANBAN_COLUMNS } from "./KanbanColumn";

interface KanbanBoardProps {
    tasks: Task[];
    users: UserData[];
    selectedUserId: string;
    onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onTaskClick?: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    users,
    onTaskStatusChange,
    onTaskClick,
}) => {
    const { isDarkMode } = useTheme();

    // Group tasks by status (tasks are already filtered by user and date)
    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            pending: [],
            in_progress: [],
            completed: [],
            cancelled: [],
        };

        // Sort tasks by updatedAt Ascending (oldest first -> newest last)
        const sortedTasks = [...tasks].sort((a, b) => {
            const timeA = a.base?.updatedAt || a.base?.createdAt || 0;
            const timeB = b.base?.updatedAt || b.base?.createdAt || 0;
            return timeA - timeB;
        });

        sortedTasks.forEach((task) => {
            const status = (task.status as TaskStatus) || "pending";
            if (grouped[status]) {
                grouped[status].push(task);
            } else {
                // If status doesn't match, put in pending
                grouped.pending.push(task);
            }
        });

        return grouped;
    }, [tasks]);

    // Handle drop - task ID is passed directly from the column
    const handleDrop = (taskId: string, targetStatus: TaskStatus) => {
        console.log("[KanbanBoard] handleDrop called - taskId:", taskId, "targetStatus:", targetStatus);
        if (taskId) {
            onTaskStatusChange(taskId, targetStatus);
        }
    };

    return (
        <div
            className={`
        h-full w-full overflow-x-auto overflow-y-hidden
        ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
        ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
    `}
            dir="rtl"
        >
            <div className="flex h-full gap-4 lg:gap-6 p-4 lg:p-6">
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        title={column.title}
                        status={column.status}
                        tasks={tasksByStatus[column.status]}
                        users={users}
                        icon={column.icon}
                        colorClass={column.colorClass}
                        onDrop={handleDrop}
                        onTaskStatusChange={onTaskStatusChange}
                        onTaskClick={onTaskClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
