import React, { useMemo, useState, useCallback } from "react";
import { MoveLeft } from "lucide-react";
import { useTheme, useAuth } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanColumn, { getKanbanColumns } from "./KanbanColumn";
import { type DropConfirmRequest } from "./KanbanTaskCard";
import { ConfirmModal } from "../../../components/modal/modal-confirm";

interface KanbanBoardProps {
  tasks: Task[];
  users: UserData[];
  selectedUserId: string;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

import { StatusChangeContent } from "../../../components/modal/modal-confirm/StatusChangeContent";

// Helper to get status label removal
const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  users,
  onTaskStatusChange,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Get columns based on user role
  const columns = useMemo(() => getKanbanColumns(isAdmin), [isAdmin]);

  // Confirmation modal state
  const [confirmRequest, setConfirmRequest] =
    useState<DropConfirmRequest | null>(null);

  // Group tasks by status (tasks are already filtered by user and date)
  const tasksByStatus = useMemo(() => {
    // ... (rest of the useMemo logic)
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      pending_approval: [],
      completed: [],
    };
    tasks.forEach((task) => {
      const status = (task.status as TaskStatus) || "pending";
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped.pending.push(task);
      }
    });
    // Priority order: high (1), medium (2), low (3)
    const priorityOrder: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3,
    };

    // Sort pending and in_progress by priority (high at top → low at bottom)
    grouped.pending.sort((a, b) => {
      const priorityA = priorityOrder[a.priority || "medium"] ?? 2;
      const priorityB = priorityOrder[b.priority || "medium"] ?? 2;
      return priorityA - priorityB;
    });

    grouped.in_progress.sort((a, b) => {
      const priorityA = priorityOrder[a.priority || "medium"] ?? 2;
      const priorityB = priorityOrder[b.priority || "medium"] ?? 2;
      return priorityA - priorityB;
    });

    // Sort pending_approval by time (oldest first at top, newest at bottom)
    grouped.pending_approval.sort((a, b) => {
      const timeA = a.base?.updatedAt || a.base?.createdAt || 0;
      const timeB = b.base?.updatedAt || b.base?.createdAt || 0;
      return timeA - timeB;
    });

    // Sort completed by time (oldest first at top, newest at bottom)
    grouped.completed.sort((a, b) => {
      const timeA = a.base?.updatedAt || a.base?.createdAt || 0;
      const timeB = b.base?.updatedAt || b.base?.createdAt || 0;
      return timeA - timeB;
    });
    return grouped;
  }, [tasks]);

  // Handle drop - task ID is passed directly from the column
  const handleDrop = (taskId: string, targetStatus: TaskStatus) => {
    if (taskId) {
      onTaskStatusChange(taskId, targetStatus);
    }
  };

  // Handle drop confirmation request from KanbanTaskCard
  const handleDropConfirmRequest = useCallback(
    (request: DropConfirmRequest) => {
      setConfirmRequest(request);
    },
    [],
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
        <div
          data-tour="kanban-columns"
          className="flex h-full gap-4 lg:gap-6 p-4 lg:p-6"
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              columnDef={column}
              tasks={column.statuses.flatMap((s) => tasksByStatus[s] || [])}
              users={users}
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
            <StatusChangeContent
              taskTitle={confirmRequest.taskTitle}
              fromStatus={confirmRequest.fromStatus}
              toStatus={
                confirmRequest.toStatus === "completed" && !isAdmin
                  ? "pending_approval"
                  : confirmRequest.toStatus
              }
              isDarkMode={isDarkMode}
            />
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
