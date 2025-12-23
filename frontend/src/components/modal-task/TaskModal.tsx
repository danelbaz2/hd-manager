import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, useSettings } from "../../contexts";
import { useTaskModal } from "./TaskModalContext";
import { updateTask, addTaskNote, type TaskFormData } from "../../api/tasksApi";
import { ToastContainer, useToast } from "../alert-feedback";
import type { TaskPriority } from "../../schemas/taskTypes";

import { HistoryTimeline } from "./history";
import { getActionDescription } from "./history/historyUtils";

import { TaskHeader } from "./parts/TaskHeader";
import { TaskFooter } from "./parts/TaskFooter";
import { TaskForm } from "./parts/TaskForm";
import { TaskDetails } from "./parts/TaskDetails";

const TaskModal: React.FC = () => {
  const { isDarkMode } = useTheme();
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
  const { isOpen, task, closeTaskModal, onTaskUpdated } = useTaskModal();
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<
    string[]
  >([]);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Initialize/Reset form
  useEffect(() => {
    if (isOpen && task) {
      setActiveTab("details");
      setIsEditMode(false);
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority((task.priority as TaskPriority) || "medium");
      setSelectedSecondaryTagIds(task.secondaryTagIds || []);
      setSelectedUserIds(task.responsibleUserIds || []);
      setStartDate(
        task.date ? new Date(task.date).toISOString().split("T")[0] : ""
      );
      setDeadline(
        task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""
      );
    }
  }, [isOpen, task]);

  const handleCancelEdit = useCallback(() => {
    if (!task) return;
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority((task.priority as TaskPriority) || "medium");
    setSelectedSecondaryTagIds(task.secondaryTagIds || []);
    setSelectedUserIds(task.responsibleUserIds || []);
    setStartDate(
      task.date ? new Date(task.date).toISOString().split("T")[0] : ""
    );
    setDeadline(
      task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""
    );
    setIsEditMode(false);
  }, [task]);

  const handleSave = useCallback(async () => {
    if (!task) return;
    if (!title.trim()) {
      showWarning("שדה חסר", "יש להזין כותרת למשימה");
      return;
    }
    setIsSubmitting(true);
    try {
      const taskData: Partial<TaskFormData> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        date: startDate ? new Date(startDate).getTime() : undefined,
        deadline: deadline ? new Date(deadline).getTime() : undefined,
        responsibleUserIds: selectedUserIds,
        secondaryTagIds: selectedSecondaryTagIds,
      };
      const response = await updateTask(task.id, taskData);
      if (response.success) {
        showSuccess("עודכן בהצלחה", "המשימה עודכנה");
        setIsEditMode(false);
        refreshTasks();
        refreshTaskHistory();
        onTaskUpdated?.();
      } else {
        showError("שגיאה", response.error || "אירעה שגיאה");
      }
    } catch {
      showError("שגיאה", "אירעה שגיאה");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    task,
    title,
    description,
    priority,
    startDate,
    deadline,
    selectedUserIds,
    selectedSecondaryTagIds,
  ]); // Simplified deps

  const handleAddNote = useCallback(
    async (text: string) => {
      if (!task) return;
      try {
        const response = await addTaskNote(task.id, text);
        if (response.success && response.data) {
          addHistoryEntry(response.data);
          showSuccess("הערה נוספה בהצלחה");
        } else {
          showError("שגיאה בהוספת הערה");
        }
      } catch {
        showError("שגיאה בהוספת הערה");
      }
    },
    [task, addTaskNote, addHistoryEntry, showError, showSuccess]
  );

  const history = useMemo(() => {
    if (!task) return [];
    return taskHistory.filter((entry) => entry.taskId === task.id);
  }, [task, taskHistory]);

  const handleGetActionDescription = useCallback(
    (entry: any, config: any) => {
      return getActionDescription(
        entry,
        config,
        users,
        secondaryTags,
        isDarkMode
      );
    },
    [users, secondaryTags, isDarkMode]
  );

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeTaskModal}
      />
      <div
        className={`relative z-10 w-full max-w-2xl lg:max-w-3xl min-h-[500px] h-[80vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
        dir="rtl"
      >
        <TaskHeader
          isEditMode={isEditMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          closeTaskModal={closeTaskModal}
          isDarkMode={isDarkMode}
        />
        <div
          className={`px-6 py-4 flex-1 flex flex-col min-h-0 ${
            !isEditMode && activeTab === "history"
              ? "overflow-hidden"
              : "overflow-y-auto"
          } ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}
        >
          {isEditMode ? (
            <TaskForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              priority={priority}
              setPriority={setPriority}
              startDate={startDate}
              setStartDate={setStartDate}
              deadline={deadline}
              setDeadline={setDeadline}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              selectedSecondaryTagIds={selectedSecondaryTagIds}
              setSelectedSecondaryTagIds={setSelectedSecondaryTagIds}
              primaryTags={primaryTags}
              secondaryTags={secondaryTags}
              users={users}
              isDarkMode={isDarkMode}
            />
          ) : activeTab === "history" ? (
            <HistoryTimeline
              history={history}
              users={users}
              isDarkMode={isDarkMode}
              isLoading={isLoadingHistory}
              onAddNote={handleAddNote}
              getActionDescription={handleGetActionDescription}
            />
          ) : (
            <TaskDetails
              task={task}
              isDarkMode={isDarkMode}
              primaryTags={primaryTags}
              secondaryTags={secondaryTags}
              users={users}
            />
          )}
        </div>
        <TaskFooter
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          handleSave={handleSave}
          handleCancelEdit={handleCancelEdit}
          handleEditClick={() => setIsEditMode(true)}
          closeTaskModal={closeTaskModal}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
export default TaskModal;
