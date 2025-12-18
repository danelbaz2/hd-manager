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
    selectedUserId,
    onTaskStatusChange,
    onTaskClick,
}) => {
    const { isDarkMode } = useTheme();

    // Filter tasks for the selected user
    const userTasks = useMemo(() => {
        return tasks.filter((task) =>
            task.responsibleUsersId?.includes(selectedUserId)
        );
    }, [tasks, selectedUserId]);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            pending: [],
            in_progress: [],
            completed: [],
            cancelled: [],
        };

        userTasks.forEach((task) => {
            const status = (task.status as TaskStatus) || "pending";
            if (grouped[status]) {
                grouped[status].push(task);
            } else {
                // If status doesn't match, put in pending
                grouped.pending.push(task);
            }
        });

        return grouped;
    }, [userTasks]);

    // Handle drop - get task ID from dataTransfer and update status
    const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) {
            onTaskStatusChange(taskId, targetStatus);
        }
    };

    return (
        <div
            className={`
        h-full w-full overflow-x-auto overflow-y-hidden
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
                        onTaskClick={onTaskClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
