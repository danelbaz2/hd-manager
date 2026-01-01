import { useState, useEffect, useCallback } from "react";
import { updateTask, type TaskFormData, type Task, type TaskStatus } from "../../../../api/tasksApi";
import type { TaskPriority } from "../../../../schemas/taskTypes";
import { parseDateToTimestamp, timestampToDateStr, hasFormChanges, initFormFromTask } from "./formUtils";

interface UseTaskFormProps {
  task: Task | null;
  isOpen: boolean;
  onSuccess: (task: Task) => void;
  onError: (message: string) => void;
  onWarning: (title: string, message: string) => void;
  refreshTasks: () => void;
  refreshTaskHistory: () => void;
  onTaskUpdated?: () => void;
}

export const useTaskForm = ({
  task, isOpen, onSuccess, onError, onWarning, refreshTasks, refreshTaskHistory, onTaskUpdated,
}: UseTaskFormProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<string[]>([]);
  const [selectedPrimaryTagIds, setSelectedPrimaryTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && task) {
      const init = initFormFromTask(task);
      setIsEditMode(false);
      setTitle(init.title);
      setDescription(init.description);
      setPriority(init.priority);
      setStatus(task.status || "pending");
      setSelectedSecondaryTagIds(init.selectedSecondaryTagIds);
      setSelectedPrimaryTagIds(init.selectedPrimaryTagIds);
      setSelectedUserIds(init.selectedUserIds);
      setStartDate(init.startDate);
      setDeadline(init.deadline);
    }
  }, [isOpen, task]);

  const handleSetDeadline = useCallback((newDeadline: string) => {
    if (!newDeadline) { setDeadline(""); return; }
    if (startDate && parseDateToTimestamp(newDeadline) < parseDateToTimestamp(startDate)) {
      onWarning("תאריך לא תקין", "לא ניתן לבחור תאריך יעד לפני תאריך ההתחלה");
      return;
    }
    setDeadline(newDeadline);
  }, [startDate, onWarning]);

  const handleSetStartDate = useCallback((newStartDate: string) => {
    setStartDate(newStartDate);
    if (deadline && newStartDate && parseDateToTimestamp(deadline) < parseDateToTimestamp(newStartDate)) {
      setDeadline(newStartDate);
    }
  }, [deadline]);

  const handleCancelEdit = useCallback(() => {
    if (!task) return;
    const init = initFormFromTask(task);
    setTitle(init.title);
    setDescription(init.description);
    setPriority(init.priority);
    setStatus(task.status || "pending");
    setSelectedSecondaryTagIds(init.selectedSecondaryTagIds);
    setSelectedPrimaryTagIds(init.selectedPrimaryTagIds);
    setSelectedUserIds(init.selectedUserIds);
    setStartDate(init.startDate);
    setDeadline(init.deadline);
    setIsEditMode(false);
  }, [task]);

  const handleSave = useCallback(async () => {
    if (!task) return;
    if (!title.trim()) { onWarning("שדה חסר", "יש להזין כותרת למשימה"); return; }

    if (!hasFormChanges(task, title, description, priority, startDate, deadline, selectedUserIds, selectedPrimaryTagIds, selectedSecondaryTagIds)) {
      onWarning("אין שינויים", "לא בוצעו שינויים במשימה");
      setIsEditMode(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const originalStartDate = timestampToDateStr(task.date);
      const originalDeadline = timestampToDateStr(task.deadline);
      const taskData: Partial<TaskFormData> = {
        title: title.trim(), description: description.trim() || undefined, priority,
        responsibleUserIds: selectedUserIds, primaryTagIds: selectedPrimaryTagIds, secondaryTagIds: selectedSecondaryTagIds,
      };
      if (startDate !== originalStartDate) taskData.date = startDate ? new Date(startDate).getTime() : undefined;
      if (deadline !== originalDeadline) taskData.deadline = deadline ? new Date(deadline).getTime() : undefined;

      const response = await updateTask(task.id, taskData);
      if (response.success && response.data) {
        onSuccess(response.data);
        setIsEditMode(false);
        refreshTasks();
        refreshTaskHistory();
        onTaskUpdated?.();
      } else { onError(response.error || "אירעה שגיאה"); }
    } catch { onError("אירעה שגיאה"); }
    finally { setIsSubmitting(false); }
  }, [task, title, description, priority, startDate, deadline, selectedUserIds, selectedSecondaryTagIds, selectedPrimaryTagIds, onSuccess, onError, onWarning, refreshTasks, refreshTaskHistory, onTaskUpdated]);

  return {
    isEditMode, setIsEditMode, isSubmitting,
    title, setTitle, description, setDescription, priority, setPriority,
    status, setStatus,
    startDate, setStartDate: handleSetStartDate, deadline, setDeadline: handleSetDeadline,
    selectedUserIds, setSelectedUserIds, selectedSecondaryTagIds, setSelectedSecondaryTagIds,
    selectedPrimaryTagIds, setSelectedPrimaryTagIds, handleCancelEdit, handleSave,
  };
};
