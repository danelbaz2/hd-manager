import React, {
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Virtuoso } from "react-virtuoso";
import { UpdateItem } from "./UpdateItem";
import { useAllTasksHistoryQuery } from "../../../../../api/queries";
import type { UpdatesTaskProps } from "./types";
import type { TaskHistoryEntry } from "../../../../../api/tasksApi";
import { ScrollToLatestButton } from "../../../../../components/common/ScrollToLatestButton";

export const UpdatesTask: React.FC<UpdatesTaskProps> = ({
  taskTitleMap,
  primaryTags,
  secondaryTags,
  isDarkMode,
  selectedDate,
  onUpdateClick,
  onDataRefresh: _onDataRefresh,
  updatesOverride,
  lastSeen = 0,
  onLatestUpdate,
  currentUserId,
}) => {
  // React Query - History (cached)
  const { data: taskHistory = [], isLoading: isLoadingHistory } = useAllTasksHistoryQuery();

  // Helper: Filter history by date
  const getHistoryForDate = useCallback((dateTimestamp: number) => {
    const start = new Date(dateTimestamp);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateTimestamp);
    end.setHours(23, 59, 59, 999);
    return taskHistory.filter((entry) =>
      entry.timestamp >= start.getTime() && entry.timestamp <= end.getTime()
    );
  }, [taskHistory]);

  // Get updates for this date from the global source
  const contextUpdates = useMemo(
    () => getHistoryForDate(selectedDate),
    [getHistoryForDate, selectedDate]
  );

  // Use override if provided (for demo/tour), otherwise use context data
  const rawUpdates = updatesOverride || contextUpdates;
  const updates = useMemo(() => {
    return [...rawUpdates].sort((a, b) => b.timestamp - a.timestamp);
  }, [rawUpdates]);
  const isLoading = updatesOverride ? false : isLoadingHistory;

  // Ref for scroll to top button
  const scrollerRef = useRef<HTMLElement>(null);

  // Report latest timestamp for parent notifications
  useEffect(() => {
    if (updates.length > 0 && onLatestUpdate) {
      const maxTs = Math.max(...updates.map((u) => u.timestamp));
      onLatestUpdate(maxTs);
    }
  }, [updates, onLatestUpdate]);

  // Render single item for virtuoso
  const renderItem = useCallback(
    (_index: number, entry: TaskHistoryEntry) => (
      <UpdateItem
        key={entry.id}
        entry={entry}
        taskTitle={taskTitleMap[entry.taskId]}
        isDarkMode={isDarkMode}
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        onClick={() => onUpdateClick(entry.taskId)}
        lastSeen={lastSeen}
        currentUserId={currentUserId}
      />
    ),
    [taskTitleMap, isDarkMode, primaryTags, secondaryTags, onUpdateClick, lastSeen, currentUserId]
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
    <div className="h-full relative">
      <Virtuoso
        data={updates}
        itemContent={renderItem}
        className={`h-full ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
          }`}
        style={{ height: "100%" }}
        overscan={200}
        scrollerRef={(ref) => {
          if (ref)
            (
              scrollerRef as React.MutableRefObject<HTMLElement | null>
            ).current = ref as HTMLElement;
        }}
      />
      <ScrollToLatestButton containerRef={scrollerRef} direction="up" />
    </div>
  );
};
