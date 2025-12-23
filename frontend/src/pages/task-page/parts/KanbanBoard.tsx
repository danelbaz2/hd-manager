import React, { useMemo, useState, useCallback } from "react";
import { MoveLeft } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanColumn, { KANBAN_COLUMNS } from "./KanbanColumn";
import { type DropConfirmRequest } from "./KanbanTaskCard";
import { ConfirmModal } from "../../../components/confirm-modal";

interface KanbanBoardProps {
  tasks: Task[];
  users: UserData[];
  selectedUserId: string;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

// Helper to get status label in Hebrew
const getStatusLabel = (status: string): string => {
  const column = KANBAN_COLUMNS.find((c) => c.status === status);
  return column?.title || status;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  users,
  onTaskStatusChange,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();

  // Confirmation modal state
  const [confirmRequest, setConfirmRequest] =
    useState<DropConfirmRequest | null>(null);

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
        grouped.pending.push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Handle drop - task ID is passed directly from the column
  const handleDrop = (taskId: string, targetStatus: TaskStatus) => {
    console.log(
      "[KanbanBoard] handleDrop called - taskId:",
      taskId,
      "targetStatus:",
      targetStatus
    );
    if (taskId) {
      onTaskStatusChange(taskId, targetStatus);
    }
  };

  // Handle drop confirmation request from KanbanTaskCard
  const handleDropConfirmRequest = useCallback(
    (request: DropConfirmRequest) => {
      setConfirmRequest(request);
    },
    []
  );

  // Handle confirmation
  const handleConfirm = useCallback(() => {
    if (confirmRequest) {
      confirmRequest.onConfirm();
      setConfirmRequest(null);
    }
  }, [confirmRequest]);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    if (confirmRequest) {
      confirmRequest.onCancel();
      setConfirmRequest(null);
    }
  }, [confirmRequest]);

  return (
    <>
      <div
        className={`
                    h-full w-full overflow-x-auto overflow-y-hidden
                    ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
                    ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
                `}
        dir="rtl"
      >
        {/* Kanban Columns */}
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
              onDropConfirmRequest={handleDropConfirmRequest}
            />
          ))}
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmRequest}
        title="שינוי סטטוס משימה"
        text={
          confirmRequest ? (
            <div className="space-y-3">
              <p>
                האם להעביר את המשימה{" "}
                <strong
                  className={isDarkMode ? "text-white" : "text-slate-800"}
                >
                  "{confirmRequest.taskTitle}"
                </strong>
                ?
              </p>
              {/* Status change visualization */}
              <div
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-slate-100/80"
                }`}
                dir="rtl"
              >
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${
                    isDarkMode
                      ? "bg-slate-600 text-slate-200"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {getStatusLabel(confirmRequest.fromStatus)}
                </span>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <MoveLeft size={16} className="text-blue-500" />
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${
                    isDarkMode
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {getStatusLabel(confirmRequest.toStatus)}
                </span>
              </div>
            </div>
          ) : null
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDarkMode={isDarkMode}
        variant="info"
        headerIcon={MoveLeft}
      />
    </>
  );
};

export default KanbanBoard;
