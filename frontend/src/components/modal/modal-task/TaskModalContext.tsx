import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Task, TaskHistoryEntry } from "../../../api/tasksApi";
import { socketManager } from "../../../lib/socket/socketManager";

interface TaskModalContextType {
    isOpen: boolean;
    task: Task | null;
    enableFileHandle: boolean;
    openTaskModal: (task: Task, options?: { enableFileHandle?: boolean }) => void;
    closeTaskModal: () => void;
    onTaskUpdated?: () => void;
    setOnTaskUpdated: (callback: (() => void) | undefined) => void;
    updateCurrentTask: (task: Task) => void;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

interface TaskModalProviderProps {
    children: React.ReactNode;
}

export const TaskModalProvider: React.FC<TaskModalProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [task, setTask] = useState<Task | null>(null);
    const [enableFileHandle, setEnableFileHandle] = useState(true);
    const [onTaskUpdated, setOnTaskUpdatedCallback] = useState<(() => void) | undefined>(undefined);

    // Listen for real-time updates via socket
    useEffect(() => {
        if (!isOpen || !task) return;

        const handleTaskUpdate = (entry: TaskHistoryEntry) => {
            // Check if the update is for the currently open task
            if (entry.taskId === task.id) {
                // If the update contains the full task data (real-time sync)
                if (entry.fullTask) {
                    setTask(entry.fullTask);
                }

                // Always trigger the update callback for parent lists/components
                if (onTaskUpdated) {
                    onTaskUpdated();
                }
            }
        };

        // Subscribe to socket events
        const unsubscribe = socketManager.onTaskUpdate(handleTaskUpdate);

        return () => {
            unsubscribe();
        };
    }, [isOpen, task?.id, onTaskUpdated]);

    const openTaskModal = useCallback((taskToOpen: Task, options?: { enableFileHandle?: boolean }) => {
        setTask(taskToOpen);
        setEnableFileHandle(options?.enableFileHandle ?? true); // Default to true
        setIsOpen(true);
    }, []);

    const closeTaskModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setTask(null);
        }, 200);
    }, []);

    const setOnTaskUpdated = useCallback((callback: (() => void) | undefined) => {
        setOnTaskUpdatedCallback(() => callback);
    }, []);

    const updateCurrentTask = useCallback((updatedTask: Task) => {
        setTask(updatedTask);
    }, []);

    return (
        <TaskModalContext.Provider
            value={{
                isOpen,
                task,
                enableFileHandle,
                openTaskModal,
                closeTaskModal,
                onTaskUpdated,
                setOnTaskUpdated,
                updateCurrentTask,
            }}
        >
            {children}
        </TaskModalContext.Provider>
    );
};

export const useTaskModal = (): TaskModalContextType => {
    const context = useContext(TaskModalContext);
    if (context === undefined) {
        throw new Error("useTaskModal must be used within a TaskModalProvider");
    }
    return context;
};
