import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, useSettings, useAuth } from "../../contexts";
import { useTaskModal } from "./TaskModalContext";
import { addTaskNote } from "../../api/tasksApi";
import { useToast } from "../alert-feedback";
import { ConfirmModal } from "../confirm-modal";
import { getActionDescription } from "./history/historyUtils";
import { ModalContainer } from "./parts/ModalContainer";
import { useTaskDelete, useTaskForm } from "./hooks";

const TaskModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user: authUser } = useAuth();
  const {
    primaryTags,
    secondaryTags,
    users,
    taskHistory,
    addHistoryEntry,
    isLoadingHistory,
    refreshTasks,
    refreshTaskHistory,
  } = useSettings();
  const { isOpen, task, closeTaskModal, onTaskUpdated, updateCurrentTask } =
    useTaskModal();
  const {
    alerts,
    showSuccess,
    showError,
    showWarning,
    dismissAlert,
    clearAllAlerts,
  } = useToast();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const isAdmin = authUser?.role === "admin";

  const form = useTaskForm({
    task,
    isOpen,
    onSuccess: (t) => {
      showSuccess("עודכן בהצלחה", "המשימה עודכנה");
      updateCurrentTask(t);
    },
    onError: (m) => showError("שגיאה", m),
    onWarning: showWarning,
    refreshTasks,
    refreshTaskHistory,
    onTaskUpdated,
  });

  const del = useTaskDelete({
    taskId: task?.id,
    onSuccess: () => showSuccess("נמחק בהצלחה", "המשימה נמחקה"),
    onError: (m) => showError("שגיאה", m),
    closeModal: closeTaskModal,
    refreshTasks,
  });

  useEffect(() => {
    if (!isOpen) setActiveTab("details");
    clearAllAlerts();
  }, [isOpen, clearAllAlerts]);

  const handleAddNote = useCallback(
    async (text: string) => {
      if (!task) return;
      try {
        const r = await addTaskNote(task.id, text);
        r.success && r.data
          ? addHistoryEntry(r.data)
          : showError("שגיאה", "שגיאה בהוספת הערה");
      } catch {
        showError("שגיאה", "שגיאה בהוספת הערה");
      }
    },
    [task, addHistoryEntry, showError]
  );

  const history = useMemo(
    () => (task ? taskHistory.filter((e) => e.taskId === task.id) : []),
    [task, taskHistory]
  );
  const getDesc = useCallback(
    (e: any, c: any) =>
      getActionDescription(e, c, users, secondaryTags, primaryTags, isDarkMode),
    [users, secondaryTags, primaryTags, isDarkMode]
  );

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ModalContainer
        task={task}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        form={form}
        del={del}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        history={history}
        users={users}
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        isLoadingHistory={isLoadingHistory}
        onAddNote={handleAddNote}
        getActionDescription={getDesc}
        closeTaskModal={closeTaskModal}
        alerts={alerts}
        dismissAlert={dismissAlert}
      />
      <ConfirmModal
        isOpen={del.showDeleteConfirm}
        title="מחיקת משימה"
        text={
          <>
            האם אתה בטוח שברצונך למחוק את המשימה <strong>"{task.title}"</strong>
            ?
          </>
        }
        onConfirm={del.confirmDelete}
        onCancel={del.closeDeleteConfirm}
        isDarkMode={isDarkMode}
        variant="danger"
        showIrreversibleWarning
      />
    </div>
  );
};

export default TaskModal;
