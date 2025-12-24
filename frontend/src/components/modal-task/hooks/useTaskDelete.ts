import { useState, useCallback } from "react";
import { deleteTask } from "../../../api/tasksApi";

interface UseTaskDeleteProps {
  taskId: string | undefined;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  closeModal: () => void;
  refreshTasks: () => void;
}

interface UseTaskDeleteResult {
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  openDeleteConfirm: () => void;
  closeDeleteConfirm: () => void;
  confirmDelete: () => Promise<void>;
}

export const useTaskDelete = ({
  taskId,
  onSuccess,
  onError,
  closeModal,
  refreshTasks,
}: UseTaskDeleteProps): UseTaskDeleteResult => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const openDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!taskId) return;

    setIsDeleting(true);
    try {
      const response = await deleteTask(taskId);
      if (response.success) {
        onSuccess?.();
        closeDeleteConfirm();
        closeModal();
        refreshTasks();
      } else {
        onError?.(response.error || "אירעה שגיאה במחיקה");
      }
    } catch {
      onError?.("אירעה שגיאה במחיקה");
    } finally {
      setIsDeleting(false);
    }
  }, [taskId, onSuccess, onError, closeModal, refreshTasks, closeDeleteConfirm]);

  return {
    isDeleting,
    showDeleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  };
};

export default useTaskDelete;
