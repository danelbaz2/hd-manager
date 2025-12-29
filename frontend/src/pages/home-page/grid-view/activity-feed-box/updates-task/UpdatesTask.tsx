import React, { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { UpdateItem } from "./UpdateItem";
import { useSettings } from "../../../../../contexts";
import type { UpdatesTaskProps } from "./types";
import type { TaskHistoryEntry } from "../../../../../api/tasksApi";

export const UpdatesTask: React.FC<UpdatesTaskProps> = ({
  taskTitleMap,
  users,
  primaryTags,
  secondaryTags,
  isDarkMode,
  selectedDate,
  onUpdateClick,
  onDataRefresh: _onDataRefresh, // Prefixed to silence unused warning - kept for API compatibility
  updatesOverride,
}) => {
  // Use global taskHistory from SettingsContext
  const { getHistoryForDate, isLoadingHistory } = useSettings();

  // Get updates for this date from the global source
  const contextUpdates = useMemo(() => getHistoryForDate(selectedDate), [getHistoryForDate, selectedDate]);

  // Use override if provided (for demo/tour), otherwise use context data
  const updates = updatesOverride || contextUpdates;
  const isLoading = updatesOverride ? false : isLoadingHistory;

  // Track new entries for animation
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  // Initialize known IDs on first render
  useEffect(() => {
    if (isInitialMount.current && updates.length > 0) {
      updates.forEach((u) => knownIdsRef.current.add(u.id));
      isInitialMount.current = false;
    }
  }, [updates]);

  // Detect new entries and animate them
  useEffect(() => {
    if (isInitialMount.current) return;

    const newEntryIds: string[] = [];
    updates.forEach((entry) => {
      if (!knownIdsRef.current.has(entry.id)) {
        newEntryIds.push(entry.id);
        knownIdsRef.current.add(entry.id);
      }
    });

    if (newEntryIds.length > 0) {
      setNewIds((prev) => {
        const next = new Set(prev);
        newEntryIds.forEach((id) => next.add(id));
        return next;
      });

      // Remove "new" status after animation
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          newEntryIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 3000);
    }
  }, [updates]);

  // Check if an entry is new
  const isNew = useCallback((id: string) => newIds.has(id), [newIds]);

  // Render single item for virtuoso
  const renderItem = useCallback(
    (_index: number, entry: TaskHistoryEntry) => (
      <UpdateItem
        key={entry.id}
        entry={entry}
        taskTitle={taskTitleMap[entry.taskId]}
        isDarkMode={isDarkMode}
        users={users}
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        onClick={() => onUpdateClick(entry.taskId)}
        isNew={isNew(entry.id)}
      />
    ),
    [taskTitleMap, isDarkMode, users, primaryTags, secondaryTags, onUpdateClick, isNew]
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
