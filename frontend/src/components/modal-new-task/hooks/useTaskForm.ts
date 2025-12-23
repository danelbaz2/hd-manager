import { useState, useEffect } from "react";
import { type TaskPriority, type TaskFormData } from "../../../schemas/taskTypes";
import { createTask } from "../../../api/tasksApi";
import { useToast } from "../../alert-feedback";

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
  startDate: string;
  setStartDate: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
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

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form and set default dates when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Clear any existing alerts when modal opens
      clearAllAlerts();

      // Reset all fields
      setTitle("");
      setDescription("");
      setPriority("medium");
      setSelectedSecondaryTagIds([]);
      setSelectedUserIds([]);

      // Set default start date (today or initialDate)
      const startDateObj = initialDate ? new Date(initialDate) : new Date();
      const startDateStr = formatDateLocal(startDateObj);
      setStartDate(startDateStr);

      // Set default deadline to same as start date
      setDeadline(startDateStr);
    } else {
      // Clear alerts when modal closes
      clearAllAlerts();
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

  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      showWarning("שדה חסר", "נא להזין כותרת משימה");
      return;
    }

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
        secondaryTagIds: selectedSecondaryTagIds.length > 0 ? selectedSecondaryTagIds : [],
      };

      console.log("Creating task with data:", taskData);
      const response = await createTask(taskData);

      if (response.success) {
        showSuccess("משימה נוצרה! 🎉", `המשימה "${title}" נוצרה בהצלחה`);
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1500);
      } else {
        showError("שגיאה ביצירת משימה", response.error || "אירעה שגיאה, נסה שוב");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      showError("שגיאה בלתי צפויה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSubmitting(false);
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
    startDate,
    setStartDate: handleSetStartDate,
    deadline,
    setDeadline: handleSetDeadline,
    selectedUserIds,
    setSelectedUserIds,
    isSubmitting,
    handleSubmit,
    alerts,
    dismissAlert,
  };
};

export default useTaskForm;
