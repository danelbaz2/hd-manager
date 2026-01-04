import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, useSettings, useAuth } from "../../../contexts";
import { useTaskModal } from "./TaskModalContext";
import { addTaskNote } from "../../../api/tasksApi";
import { useToast } from "../../alert-feedback";
import { ConfirmModal } from "../modal-confirm";
import { getActionDescription } from "./history/historyUtils";
import { ModalContainer } from "./parts/ModalContainer";
import { useTaskDelete, useTaskForm } from "./hooks";
import { useContacts } from "../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/useContacts";
import { ContactDetailModal } from "../modal-contact-detail";
import { useTagsModal } from "../modal-tags";
import { ModalOverlay } from "../../common/ModalOverlay";
import type { TaskHistoryEntry, TaskStatus } from "../../../api/tasksApi";
import type { ActionConfigItem } from "./history/historyConfig";

import { MoveLeft } from "lucide-react";
import { StatusChangeContent } from "../modal-confirm/StatusChangeContent";

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
  const { contacts, findContactByName, selectedContact, setSelectedContact } =
    useContacts();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  // Confirmation modal state split to allow animation with data
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
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

  // Handle status change request from the details view
  const handleStatusChangeRequest = useCallback(
    (newStatus: TaskStatus) => {
      if (newStatus === task?.status) return;
      setPendingStatus(newStatus);
    },
    [task]
  );

  // Confirm status change
  const handleConfirmStatusChange = async () => {
    if (!task || !pendingStatus) return;

    // Optimistically update the local form state if we're in edit mode
    if (form.isEditMode) {
      form.setStatus(pendingStatus);
    }

    try {
      // Use the form hook's logic/API or direct API update here.
      // Since useTaskForm handles "save" for the whole form, strictly for status change
      // in view mode we might want a direct update or leverage existing update logic.
      // For simplicity and to reuse history tracking:
      const { updateTask } = await import("../../../api/tasksApi");
      const response = await updateTask(task.id, { status: pendingStatus });

      if (response.success && response.data) {
        updateCurrentTask(response.data);
        showSuccess("סטטוס עודכן", "סטטוס המשימה עודכן בהצלחה");
        refreshTasks();
        refreshTaskHistory();
      } else {
        showError("שגיאה", "שגיאה בעדכון הסטטוס");
      }
    } catch (error) {
      showError("שגיאה", "שגיאה בעדכון הסטטוס");
    } finally {
      setPendingStatus(null);
    }
  };

  const del = useTaskDelete({
    taskId: task?.id,
    onSuccess: () => showSuccess("נמחק בהצלחה", "המשימה נמחקה"),
    onError: (m) => showError("שגיאה", m),
    closeModal: closeTaskModal,
    refreshTasks,
  });

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("details");
      setPendingStatus(null);
    }
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

  const handleMentionClick = useCallback(
    (contactName: string) => {
      const contact = findContactByName(contactName);
      if (contact) setSelectedContact(contact);
    },
    [findContactByName, setSelectedContact]
  );

  const history = useMemo(
    () => (task ? taskHistory.filter((e) => e.taskId === task.id) : []),
    [task, taskHistory]
  );

  const getDesc = useCallback(
    (
      e: TaskHistoryEntry,
      c: ActionConfigItem,
      onMentionClick?: (contactName: string) => void
    ) =>
      getActionDescription(
        e,
        c,
        users,
        secondaryTags,
        primaryTags,
        isDarkMode,
        onMentionClick,
        contacts
      ),
    [users, secondaryTags, primaryTags, isDarkMode, contacts]
  );

  const { state: tagsModalState } = useTagsModal();
  const tagsModalOffset = tagsModalState.isOpen ? 320 : 0;

  if (!task) return null;

  return (
    <>
      <ModalOverlay
        isOpen={isOpen}
        onClose={closeTaskModal}
        offsetLeft={tagsModalOffset}
      >
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
          contacts={contacts}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          isLoadingHistory={isLoadingHistory}
          onAddNote={handleAddNote}
          getActionDescription={getDesc}
          onMentionClick={handleMentionClick}
          onStatusChangeRequest={handleStatusChangeRequest}
          closeTaskModal={closeTaskModal}
          alerts={alerts}
          dismissAlert={dismissAlert}
        />
      </ModalOverlay>
      <ContactDetailModal
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        isDarkMode={isDarkMode}
      />
      <ConfirmModal
        isOpen={del.showDeleteConfirm}
        title="מחיקת משימה"
        text={
          <>
            האם אתה בטוח שברצונך למחוק את המשימה <strong>"{task.title || ""}"</strong>
            ?
          </>
        }
        onConfirm={del.confirmDelete}
        onCancel={del.closeDeleteConfirm}
        isDarkMode={isDarkMode}
        variant="danger"
        showIrreversibleWarning
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingStatus}
        title="שינוי סטטוס משימה"
        text={
          pendingStatus ? (
            <StatusChangeContent
              taskTitle={task.title || ""}
              fromStatus={task.status || "pending"}
              toStatus={pendingStatus}
              isDarkMode={isDarkMode}
            />
          ) : null
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setPendingStatus(null)}
        isDarkMode={isDarkMode}
        confirmText="אישור"
        cancelText="ביטול"
        variant="info"
        headerIcon={MoveLeft}
      />
    </>
  );
};

export default TaskModal;
