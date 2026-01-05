import { useState, useEffect, useRef } from "react";
import { type TaskPriority, type TaskFormData, type TaskOptionals } from "../../../../schemas/taskTypes";
import { useCreateTaskMutation, invalidateTaskQueries } from "../../../../api/queries";
import { useToast } from "../../../alert-feedback";

interface UseTaskFormOptions {
  isOpen: boolean;
  initialDate?: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface UseTaskFormReturn {
  // Form state
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: TaskPriority;
  setPriority: (value: TaskPriority) => void;
  selectedSecondaryTagIds: string[];
  setSelectedSecondaryTagIds: (value: string[]) => void;
  selectedPrimaryTagIds: string[];
  setSelectedPrimaryTagIds: (value: string[]) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
  optionals: TaskOptionals;
  setOptionals: (value: TaskOptionals) => void;
  // Submission
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  // Toast
  alerts: ReturnType<typeof useToast>["alerts"];
  dismissAlert: ReturnType<typeof useToast>["dismissAlert"];
}

/**
 * Helper: Format date to YYYY-MM-DD using local time
 */
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string to timestamp at noon local time
 */
const parseDateToTimestamp = (dateStr: string): number => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
};

/**
 * useTaskForm - Custom hook for task creation form state and submission
 */
export const useTaskForm = ({
  isOpen,
  initialDate,
  onSuccess,
  onClose,
}: UseTaskFormOptions): UseTaskFormReturn => {
  const { alerts, showSuccess, showError, showWarning, dismissAlert, clearAllAlerts } = useToast();
  const createMutation = useCreateTaskMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<string[]>([]);
  const [selectedPrimaryTagIds, setSelectedPrimaryTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [optionals, setOptionals] = useState<TaskOptionals>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref-based lock to prevent multiple rapid submissions
  const isSubmittingRef = useRef(false);

  // Reset form and set default dates when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Clear any existing alerts when modal opens
      clearAllAlerts();

      // Reset submission lock and state
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      // Reset all fields
      setTitle("");
      setDescription("");
      setPriority("medium");
      setSelectedSecondaryTagIds([]);
      setSelectedPrimaryTagIds([]);
      setSelectedUserIds([]);
      setOptionals({});

      // Set default start date (today or initialDate)
      const startDateObj = initialDate ? new Date(initialDate) : new Date();
      const startDateStr = formatDateLocal(startDateObj);
      setStartDate(startDateStr);

      // Set default deadline to same as start date
      setDeadline(startDateStr);
    } else {
      // Clear alerts and reset lock when modal closes
      clearAllAlerts();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isOpen, initialDate, clearAllAlerts]);

  // Validate and set deadline - ensure it's not before start date
  const handleSetDeadline = (newDeadline: string) => {
    if (!newDeadline) {
      setDeadline("");
      return;
    }

    // If start date is set, validate deadline is not before it
    if (startDate) {
      const startTimestamp = parseDateToTimestamp(startDate);
      const deadlineTimestamp = parseDateToTimestamp(newDeadline);

      if (deadlineTimestamp < startTimestamp) {
        showWarning(
          "תאריך לא תקין",
          "לא ניתן לבחור תאריך יעד לפני תאריך ההתחלה"
        );
        return; // Don't update the deadline
      }
    }

    setDeadline(newDeadline);
  };

  // Handle start date change - update deadline if it becomes invalid
  const handleSetStartDate = (newStartDate: string) => {
    setStartDate(newStartDate);

    // If deadline exists and is now before the new start date, update deadline to match
    if (deadline && newStartDate) {
      const startTimestamp = parseDateToTimestamp(newStartDate);
      const deadlineTimestamp = parseDateToTimestamp(deadline);

      if (deadlineTimestamp < startTimestamp) {
        // Update deadline to match the new start date
        setDeadline(newStartDate);
      }
    }
  };

  // Handle submit with ref-based lock to prevent multiple submissions
  const handleSubmit = async () => {
    // Check ref-based lock first (synchronous, prevents race condition)
    if (isSubmittingRef.current) {
      console.log("Submission already in progress, ignoring click");
      return;
    }

    if (!title.trim()) {
      showWarning("שדה חסר", "נא להזין כותרת משימה");
      return;
    }

    if (optionals.externalSystem && !optionals.externalId?.trim()) {
      showWarning("שדה חסר", "נא להזין מספר תקלה");
      return;
    }

    // Set both ref and state
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Calculate deadline: use selected deadline, or default to startDate + 1 day
      const startTimestamp = startDate ? parseDateToTimestamp(startDate) : Date.now();
      const deadlineTimestamp = deadline
        ? parseDateToTimestamp(deadline)
        : startTimestamp + 24 * 60 * 60 * 1000; // Add 1 day in milliseconds

      const taskData: TaskFormData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        date: startTimestamp,
        deadline: deadlineTimestamp,
        responsibleUserIds: selectedUserIds.length > 0 ? selectedUserIds : [],
        primaryTagIds: selectedPrimaryTagIds.length > 0 ? selectedPrimaryTagIds : [],
        secondaryTagIds: selectedSecondaryTagIds.length > 0 ? selectedSecondaryTagIds : [],
        optionals,
      };

      console.log("Creating task with data:", taskData);
      await createMutation.mutateAsync(taskData);

      showSuccess("משימה נוצרה! 🎉", `המשימה "${title}" נוצרה בהצלחה`);
      // Invalidate queries to refetch task lists
      invalidateTaskQueries();

      // Notify parent of success (for refreshing task list)
      onSuccess?.();

      // Reset form fields to initial state (modal stays open for creating more tasks)
      const resetStartDate = initialDate ? new Date(initialDate) : new Date();
      const resetStartDateStr = formatDateLocal(resetStartDate);

      setTitle("");
      setDescription("");
      setPriority("medium");
      setSelectedSecondaryTagIds([]);
      setSelectedPrimaryTagIds([]);
      setSelectedUserIds([]);
      setOptionals({});
      setStartDate(resetStartDateStr);
      setDeadline(resetStartDateStr);

      // Reset submission state to allow creating another task
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage = error instanceof Error ? error.message : "";

      // Check if it's a network error that may have still succeeded
      if (error instanceof Error && (error.name === "AbortError" || errorMessage.includes("Failed to fetch"))) {
        // The request might have succeeded - close modal silently
        console.log("Network error, but task may have been created");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      } else {
        showError("שגיאה בלתי צפויה", errorMessage || "אירעה שגיאה בלתי צפויה");
        // Reset lock on error to allow retry
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    selectedSecondaryTagIds,
    setSelectedSecondaryTagIds,
    selectedPrimaryTagIds,
    setSelectedPrimaryTagIds,
    startDate,
    setStartDate: handleSetStartDate,
    deadline,
    setDeadline: handleSetDeadline,
    selectedUserIds,
    setSelectedUserIds,
    optionals,
    setOptionals,
    isSubmitting,
    handleSubmit,
    alerts,
    dismissAlert,
  };
};

export default useTaskForm;
