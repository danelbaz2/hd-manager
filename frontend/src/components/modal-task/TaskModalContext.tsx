import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task } from "../../api/tasksApi";

interface TaskModalContextType {
    isOpen: boolean;
    task: Task | null;
    enableFileHandle: boolean;
    openTaskModal: (task: Task, options?: { enableFileHandle?: boolean }) => void;
    closeTaskModal: () => void;
    onTaskUpdated?: () => void;
    setOnTaskUpdated: (callback: (() => void) | undefined) => void;
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
