import { useState, useEffect, useCallback } from "react";
import { type TaskFormData, type Task, type TaskStatus, type TaskOptionals } from "../../../../api/tasksApi";
import { useUpdateTaskMutation, invalidateTaskQueries } from "../../../../api/queries";
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
  const updateMutation = useUpdateTaskMutation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<string[]>([]);
  const [selectedPrimaryTagIds, setSelectedPrimaryTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [optionals, setOptionals] = useState<TaskOptionals>({});

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
      setOptionals(init.optionals);
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
    setOptionals(init.optionals);
    setIsEditMode(false);
  }, [task]);

  const handleSave = useCallback(async () => {
    if (!task) return;
    if (!title.trim()) { onWarning("שדה חסר", "יש להזין כותרת למשימה"); return; }

    if (!hasFormChanges(task, title, description, priority, startDate, deadline, selectedUserIds, selectedPrimaryTagIds, selectedSecondaryTagIds, optionals)) {
      onWarning("אין שינויים", "לא בוצעו שינויים במשימה");
      setIsEditMode(false);
      return;
    }

    try {
      const originalStartDate = timestampToDateStr(task.date);
      const originalDeadline = timestampToDateStr(task.deadline);
      const taskData: Partial<TaskFormData> = {
        title: title.trim(), description: description.trim() || undefined, priority,
        responsibleUserIds: selectedUserIds, primaryTagIds: selectedPrimaryTagIds, secondaryTagIds: selectedSecondaryTagIds,
        optionals,
      };
      if (startDate !== originalStartDate) taskData.date = startDate ? new Date(startDate).getTime() : undefined;
      if (deadline !== originalDeadline) taskData.deadline = deadline ? new Date(deadline).getTime() : undefined;

      const updatedTask = await updateMutation.mutateAsync({ id: task.id, task: taskData });
      onSuccess(updatedTask);
      setIsEditMode(false);
      // React Query mutation handles invalidation, also trigger context refresh for compatibility
      refreshTasks();
      refreshTaskHistory();
      invalidateTaskQueries();
      onTaskUpdated?.();
    } catch (error) {
      onError(error instanceof Error ? error.message : "אירעה שגיאה");
    }
  }, [task, title, description, priority, startDate, deadline, selectedUserIds, selectedSecondaryTagIds, selectedPrimaryTagIds, optionals, onSuccess, onError, onWarning, refreshTasks, refreshTaskHistory, onTaskUpdated, updateMutation]);

  return {
    isEditMode, setIsEditMode, isSubmitting: updateMutation.isPending,
    title, setTitle, description, setDescription, priority, setPriority,
    status, setStatus,
    startDate, setStartDate: handleSetStartDate, deadline, setDeadline: handleSetDeadline,
    selectedUserIds, setSelectedUserIds, selectedSecondaryTagIds, setSelectedSecondaryTagIds,
    selectedPrimaryTagIds, setSelectedPrimaryTagIds, optionals, setOptionals, handleCancelEdit, handleSave,
  };
};
