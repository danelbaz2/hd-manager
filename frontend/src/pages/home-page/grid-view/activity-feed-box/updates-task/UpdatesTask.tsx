import React, {
  useEffect,
  useCallback,
  useState,
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
  const updates = updatesOverride || contextUpdates;
  const isLoading = updatesOverride ? false : isLoadingHistory;

  // Track new entries for animation
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  // Ref for scroll to top button
  const scrollerRef = useRef<HTMLElement>(null);

  // Check for new updates (unseen or just arrived)
  useEffect(() => {
    // Report latest timestamp
    if (updates.length > 0 && onLatestUpdate) {
      const maxTs = Math.max(...updates.map((u) => u.timestamp));
      onLatestUpdate(maxTs);
    }

    const newEntryIds: string[] = [];

    // On initial mount, we check against lastSeen
    // updates from the past that are unread should be highlighted
    if (isInitialMount.current) {
      if (updates.length > 0) {
        updates.forEach((u) => {
          knownIdsRef.current.add(u.id);
          // Highlight if newer than lastSeen
          if (u.timestamp > lastSeen) {
            newEntryIds.push(u.id);
          }
        });
        isInitialMount.current = false;
      }
    } else {
      // On subsequent updates, check for new IDs (incoming socket updates)
      updates.forEach((entry) => {
        if (!knownIdsRef.current.has(entry.id)) {
          newEntryIds.push(entry.id);
          knownIdsRef.current.add(entry.id);
        }
      });
    }

    if (newEntryIds.length > 0) {
      setNewIds((prev) => {
        const next = new Set(prev);
        newEntryIds.forEach((id) => next.add(id));
        return next;
      });

      // Remove "new" status after animation (5 seconds)
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          newEntryIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 5000);
    }
  }, [updates, lastSeen, onLatestUpdate]);

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
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        onClick={() => onUpdateClick(entry.taskId)}
        isNew={isNew(entry.id)}
      />
    ),
    [taskTitleMap, isDarkMode, primaryTags, secondaryTags, onUpdateClick, isNew]
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
