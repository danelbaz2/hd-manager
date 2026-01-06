import { useState, useEffect, useCallback } from "react";
import { type TaskFormData, type Task, type TaskStatus, type TaskOptionals } from "../../../../api/tasksApi";
import { useUpdateTaskMutation, invalidateTaskQueries } from "../../../../api/queries";
import type { TaskPriority } from "../../../../schemas/taskTypes";
import { parseDateToTimestamp, timestampToDateStr, hasFormChanges, initFormFromTask, getChangedOptionals, arraysEqual } from "./formUtils";

interface UseTaskFormProps {
  task: Task | null;
  isOpen: boolean;
  onSuccess: (task: Task) => void;
  onError: (message: string) => void;
  onWarning: (title: string, message: string) => void;
  onTaskUpdated?: () => void;
}

export const useTaskForm = ({
  task, isOpen, onSuccess, onError, onWarning, onTaskUpdated,
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

    if (optionals.externalSystem && !optionals.externalId?.trim()) {
      onWarning("שדה חסר", "נא להזין מספר תקלה");
      return;
    }

    if (optionals.externalSystem === "SNOW" && optionals.externalId && !/^INC\d{7}$/.test(optionals.externalId)) {
      onWarning("פורמט לא תקין", "INC יש להזין 7 ספרות לאחר");
      return;
    }

    if (optionals.externalSystem === "MARS" && optionals.externalId && !/^\d+$/.test(optionals.externalId)) {
      onWarning("פורמט לא תקין", "MARS חייב להכיל ספרות בלבד");
      return;
    }

    if (!hasFormChanges(task, title, description, priority, startDate, deadline, selectedUserIds, selectedPrimaryTagIds, selectedSecondaryTagIds, optionals)) {
      onWarning("אין שינויים", "לא בוצעו שינויים במשימה");
      setIsEditMode(false);
      return;
    }

    try {
      const originalStartDate = timestampToDateStr(task.date);
      const originalDeadline = timestampToDateStr(task.deadline);

      // Build taskData with only changed fields
      const taskData: Partial<TaskFormData> = {};

      // Check each field and only include if changed
      if (title.trim() !== (task.title || "")) {
        taskData.title = title.trim();
      }
      if ((description.trim() || "") !== (task.description || "")) {
        taskData.description = description.trim() || undefined;
      }
      if (priority !== (task.priority || "medium")) {
        taskData.priority = priority;
      }
      if (startDate !== originalStartDate) {
        taskData.date = startDate ? new Date(startDate).getTime() : undefined;
      }
      if (deadline !== originalDeadline) {
        taskData.deadline = deadline ? new Date(deadline).getTime() : undefined;
      }
      if (!arraysEqual(selectedUserIds, task.responsibleUserIds || [])) {
        taskData.responsibleUserIds = selectedUserIds;
      }
      if (!arraysEqual(selectedPrimaryTagIds, task.primaryTagIds || [])) {
        taskData.primaryTagIds = selectedPrimaryTagIds;
      }
      if (!arraysEqual(selectedSecondaryTagIds, task.secondaryTagIds || [])) {
        taskData.secondaryTagIds = selectedSecondaryTagIds;
      }

      // Only include changed optional fields
      // Ensure consistency: if externalSystem is cleared, externalId should also be cleared. 
      // This enforces the rule: "If there is no externalSystem, there is no externalId"
      const effectiveOptionals = { ...optionals };
      if (!effectiveOptionals.externalSystem) {
        effectiveOptionals.externalId = "";
      }

      const changedOptionals = getChangedOptionals(effectiveOptionals, task.optionals);
      if (changedOptionals) {
        taskData.optionals = changedOptionals;
      }

      const updatedTask = await updateMutation.mutateAsync({ id: task.id, task: taskData });
      onSuccess(updatedTask);
      setIsEditMode(false);
      // React Query mutation handles cache invalidation
      invalidateTaskQueries();
      onTaskUpdated?.();
    } catch (error) {
      onError(error instanceof Error ? error.message : "אירעה שגיאה");
    }
  }, [task, title, description, priority, startDate, deadline, selectedUserIds, selectedSecondaryTagIds, selectedPrimaryTagIds, optionals, onSuccess, onError, onWarning, onTaskUpdated, updateMutation]);

  return {
    isEditMode, setIsEditMode, isSubmitting: updateMutation.isPending,
    title, setTitle, description, setDescription, priority, setPriority,
    status, setStatus,
    startDate, setStartDate: handleSetStartDate, deadline, setDeadline: handleSetDeadline,
    selectedUserIds, setSelectedUserIds, selectedSecondaryTagIds, setSelectedSecondaryTagIds,
    selectedPrimaryTagIds, setSelectedPrimaryTagIds, optionals, setOptionals, handleCancelEdit, handleSave,
  };
};
