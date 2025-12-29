import React, { useEffect, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { UpdateItem } from "./UpdateItem";
import { useUpdatesData } from "./useUpdatesData";
import { useTaskUpdates } from "../../../../../contexts";
import type { UpdatesTaskProps } from "./types";
import type { TaskHistoryEntry } from "../../../../../api/tasksApi";

export const UpdatesTask: React.FC<UpdatesTaskProps> = ({
  taskTitleMap,
  users,
  isDarkMode,
  selectedDate,
  onUpdateClick,
  onDataRefresh,
  updatesOverride,
}) => {
  const { updates: apiUpdates, isLoading: apiLoading, error: apiError, fetchUpdates } = useUpdatesData({
    selectedDate,
  });

  const updates = updatesOverride || apiUpdates;
  const isLoading = updatesOverride ? false : apiLoading;
  const error = updatesOverride ? null : apiError;

  // Handle WebSocket updates - refetch and notify parent
  const handleSocketUpdate = useCallback(() => {
    fetchUpdates();
    onDataRefresh?.();
  }, [fetchUpdates, onDataRefresh]);

  // Subscribe to global WebSocket updates
  useTaskUpdates(handleSocketUpdate, true);

  // Fetch when date changes
  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Render single item for virtuoso
  const renderItem = useCallback(
    (_index: number, entry: TaskHistoryEntry) => (
      <UpdateItem
        key={entry.id}
        entry={entry}
        taskTitle={taskTitleMap[entry.taskId]}
        isDarkMode={isDarkMode}
        users={users}
        onClick={() => onUpdateClick(entry.taskId)}
      />
    ),
    [taskTitleMap, isDarkMode, users, onUpdateClick]
  );

  // Loading state
  if (isLoading && updates.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
      >
        טוען עדכונים...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm text-red-500`}
      >
        שגיאה: {error}
      </div>
    );
  }

  // Empty state
  if (updates.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
      >
        אין עדכונים למשימות ביום זה
      </div>
    );
  }

  return (
    <Virtuoso
      data={updates}
      itemContent={renderItem}
      className={`h-full ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}
      style={{ height: "100%" }}
      overscan={200}
    />
  );
};
