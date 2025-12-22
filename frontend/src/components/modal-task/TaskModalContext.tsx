import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task } from "../../api/tasksApi";

interface TaskModalContextType {
    isOpen: boolean;
    task: Task | null;
    openTaskModal: (task: Task) => void;
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
    const [onTaskUpdated, setOnTaskUpdatedCallback] = useState<(() => void) | undefined>(undefined);

    const openTaskModal = useCallback((taskToOpen: Task) => {
        setTask(taskToOpen);
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
