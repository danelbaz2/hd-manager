/**
 * SettingsContext - Composed provider for all settings contexts
 * This is a slim wrapper that combines all modular contexts
 *
 * For performance, use the specific hooks:
 * - useUsers() - for user data only
 * - useTags() - for tags data only
 * - useContacts() - for contacts data only
 * - useTasks() - for tasks data only
 * - useHistory() - for history data only
 *
 * useSettings() provides backward compatibility but may cause unnecessary re-renders
 */
import React, { type ReactNode } from "react";
import { UsersProvider, useUsers } from "./UsersContext";
import { TagsProvider, useTags } from "./TagsContext";
import { ContactsProvider, useContacts } from "./ContactsContext";
import { TasksProvider, useTasks } from "./TasksContext";
import { HistoryProvider, useHistory } from "./HistoryContext";

// Re-export individual hooks for direct usage
export { useUsers } from "./UsersContext";
export { useTags } from "./TagsContext";
export { useContacts } from "./ContactsContext";
export { useTasks } from "./TasksContext";
export { useHistory } from "./HistoryContext";

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that wraps all modular context providers
 * Use this at the app root level
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  return (
    <UsersProvider>
      <TagsProvider>
        <ContactsProvider>
          <TasksProvider>
            <HistoryProvider>{children}</HistoryProvider>
          </TasksProvider>
        </ContactsProvider>
      </TagsProvider>
    </UsersProvider>
  );
};

/**
 * Combined hook for backward compatibility
 *
 * ⚠️ WARNING: Using this hook will cause re-renders when ANY data changes.
 * For better performance, use the specific hooks (useUsers, useTasks, etc.)
 */
export const useSettings = () => {
  const { users, isLoadingUsers, refreshUsers } = useUsers();
  const { primaryTags, secondaryTags, isLoadingTags, refreshTags } = useTags();
  const { contacts, isLoadingContacts, refreshContacts } = useContacts();
  const { tasks, isLoadingTasks, refreshTasks } = useTasks();
  const {
    taskHistory,
    isLoadingHistory,
    refreshTaskHistory,
    addHistoryEntry,
    getHistoryForTask,
    getHistoryForDate,
  } = useHistory();

  // Compute overall loading state
  const isLoading =
    isLoadingUsers ||
    isLoadingTags ||
    isLoadingContacts ||
    isLoadingTasks ||
    isLoadingHistory;

  // Combined refresh function
  const refreshAll = async (silent = false) => {
    await Promise.all([
      refreshUsers(silent),
      refreshTags(silent),
      refreshContacts(silent),
      refreshTasks(silent),
      refreshTaskHistory(silent),
    ]);
  };

  return {
    // Data
    users,
    primaryTags,
    secondaryTags,
    contacts,
    tasks,
    taskHistory,
    // Loading states
    isLoading,
    isLoadingUsers,
    isLoadingTags,
    isLoadingContacts,
    isLoadingTasks,
    isLoadingHistory,
    // Refresh functions
    refreshUsers,
    refreshTags,
    refreshContacts,
    refreshTasks,
    refreshTaskHistory,
    refreshAll,
    // History helpers
    addHistoryEntry,
    getHistoryForTask,
    getHistoryForDate,
  };
};

export default SettingsProvider;
