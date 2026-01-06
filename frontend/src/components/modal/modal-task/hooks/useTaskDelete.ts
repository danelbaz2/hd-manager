import { useState, useCallback } from "react";
import { deleteTask } from "../../../../api/tasksApi";
import { invalidateTaskQueries } from "../../../../api/queries";

interface UseTaskDeleteProps {
  taskId: string | undefined;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  closeModal: () => void;
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
        invalidateTaskQueries(); // Refresh task list via React Query
      } else {
        onError?.(response.error || "אירעה שגיאה במחיקה");
      }
    } catch {
      onError?.("אירעה שגיאה במחיקה");
    } finally {
      setIsDeleting(false);
    }
  }, [taskId, onSuccess, onError, closeModal, closeDeleteConfirm]);

  return {
    isDeleting,
    showDeleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  };
};

export default useTaskDelete;
