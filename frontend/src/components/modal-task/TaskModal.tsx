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
    const { isOpen, task, closeTaskModal, onTaskUpdated, updateCurrentTask } = useTaskModal();
    const { alerts, showSuccess, showError, showWarning, dismissAlert, clearAllAlerts } =
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
    const [selectedPrimaryTagIds, setSelectedPrimaryTagIds] = useState<
        string[]
    >([]);
    const [startDate, setStartDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    // Reset tab to details and clear alerts when modal closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab("details");
            clearAllAlerts();
        } else {
            // Clear alerts when modal opens
            clearAllAlerts();
        }
    }, [isOpen, clearAllAlerts]);

    // Initialize/Reset form
    useEffect(() => {
        if (isOpen && task) {
            setIsEditMode(false);
            setTitle(task.title || "");
            setDescription(task.description || "");
            setPriority((task.priority as TaskPriority) || "medium");
            setSelectedSecondaryTagIds(task.secondaryTagIds || []);
            setSelectedPrimaryTagIds(task.primaryTagIds || []);
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
        setSelectedPrimaryTagIds(task.primaryTagIds || []);
        setSelectedUserIds(task.responsibleUserIds || []);
        setStartDate(
            task.date ? new Date(task.date).toISOString().split("T")[0] : ""
        );
        setDeadline(
            task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""
        );
        setIsEditMode(false);
    }, [task]);

    // Parse date string to timestamp at noon local time
    const parseDateToTimestamp = (dateStr: string): number => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0).getTime();
    };

    // Validate and set deadline - ensure it's not before start date
    const handleSetDeadline = useCallback((newDeadline: string) => {
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
    }, [startDate, showWarning]);

    // Handle start date change - update deadline if it becomes invalid
    const handleSetStartDate = useCallback((newStartDate: string) => {
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
    }, [deadline]);

    const handleSave = useCallback(async () => {
        if (!task) return;
        if (!title.trim()) {
            showWarning("שדה חסר", "יש להזין כותרת למשימה");
            return;
        }

        // Helper to convert timestamp to date string (same format as form state)
        const timestampToDateStr = (ts: number | undefined) =>
            ts ? new Date(ts).toISOString().split("T")[0] : "";

        // Get original values for comparison
        const originalStartDate = timestampToDateStr(task.date);
        const originalDeadline = timestampToDateStr(task.deadline);

        // Helper to compare arrays (order-insensitive)
        const arraysEqual = (a: string[], b: string[]) => {
            if (a.length !== b.length) return false;
            const sortedA = [...a].sort();
            const sortedB = [...b].sort();
            return sortedA.every((val, i) => val === sortedB[i]);
        };

        // Check if anything has changed
        const hasChanges =
            title.trim() !== (task.title || "") ||
            (description.trim() || "") !== (task.description || "") ||
            priority !== (task.priority || "medium") ||
            startDate !== originalStartDate ||
            deadline !== originalDeadline ||
            !arraysEqual(selectedUserIds, task.responsibleUserIds || []) ||
            !arraysEqual(selectedPrimaryTagIds, task.primaryTagIds || []) ||
            !arraysEqual(selectedSecondaryTagIds, task.secondaryTagIds || []);

        if (!hasChanges) {
            showWarning("אין שינויים", "לא בוצעו שינויים במשימה");
            setIsEditMode(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const taskData: Partial<TaskFormData> = {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                responsibleUserIds: selectedUserIds,
                primaryTagIds: selectedPrimaryTagIds,
                secondaryTagIds: selectedSecondaryTagIds,
            };

            // Only add date if it changed
            if (startDate !== originalStartDate) {
                taskData.date = startDate ? new Date(startDate).getTime() : undefined;
            }

            // Only add deadline if it changed
            if (deadline !== originalDeadline) {
                taskData.deadline = deadline ? new Date(deadline).getTime() : undefined;
            }

            const response = await updateTask(task.id, taskData);
            if (response.success) {
                showSuccess("עודכן בהצלחה", "המשימה עודכנה");
                // Update local task in context so View mode shows new data
                if (response.data) {
                    updateCurrentTask(response.data);
                }
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
        selectedPrimaryTagIds,
    ]); // Simplified deps

    const handleAddNote = useCallback(
        async (text: string) => {
            if (!task) return;
            try {
                const response = await addTaskNote(task.id, text);
                if (response.success && response.data) {
                    addHistoryEntry(response.data);
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
                primaryTags,
                isDarkMode
            );
        },
        [users, secondaryTags, primaryTags, isDarkMode]
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
                className={`relative z-10 w-full max-w-2xl lg:max-w-3xl min-h-[500px] h-[80vh] flex flex-col rounded-3xl border shadow-2xl ${isDarkMode
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
                    className={`px-6 py-4 flex-1 flex flex-col min-h-0 ${!isEditMode && activeTab === "history"
                        ? "overflow-visible"
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
                            setStartDate={handleSetStartDate}
                            deadline={deadline}
                            setDeadline={handleSetDeadline}
                            selectedUserIds={selectedUserIds}
                            setSelectedUserIds={setSelectedUserIds}
                            selectedSecondaryTagIds={selectedSecondaryTagIds}
                            setSelectedSecondaryTagIds={setSelectedSecondaryTagIds}
                            selectedPrimaryTagIds={selectedPrimaryTagIds}
                            setSelectedPrimaryTagIds={setSelectedPrimaryTagIds}
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
