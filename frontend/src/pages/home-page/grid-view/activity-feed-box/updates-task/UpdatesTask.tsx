import React, { useEffect, useMemo } from "react";
import { UpdateItem } from "./UpdateItem";
import { DateSeparator } from "./DateSeparator";
import { useUpdatesData } from "./useUpdatesData";
import { useUpdatesSocket } from "./useUpdatesSocket";
import type { UpdatesTaskProps, ListItem } from "./types";

// Get start of day helper
const getStartOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const UpdatesTask: React.FC<UpdatesTaskProps> = ({
  taskTitleMap,
  users,
  isDarkMode,
  selectedDate,
  onUpdateClick,
}) => {
  const { updates, isLoading, error, fetchUpdates, addUpdate } = useUpdatesData(
    { selectedDate }
  );

  // WebSocket for real-time updates
  useUpdatesSocket({ onNewUpdate: addUpdate, enabled: true });

  // Fetch when date changes
  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Build list items with date separators
  const listItems = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    let lastDateKey: string | null = null;

    for (const entry of updates) {
      const dateKey = new Date(entry.timestamp).toDateString();

      if (dateKey !== lastDateKey) {
        items.push({
          type: "date",
          date: getStartOfDay(entry.timestamp),
          key: `date-${dateKey}`,
        });
        lastDateKey = dateKey;
      }

      items.push({ type: "update", entry, key: entry.id });
    }

    return items;
  }, [updates]);

  // Loading state
  if (isLoading && updates.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
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
        className={`h-full flex items-center justify-center text-sm ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        אין עדכונים למשימות ביום זה
      </div>
    );
  }

  return (
    <div
      className={`h-full overflow-y-auto ${
        isDarkMode ? "dark-scrollbar" : "light-scrollbar"
      }`}
      dir="rtl"
    >
      <div className="flex flex-col">
        {listItems.map((item) =>
          item.type === "date" ? (
            <DateSeparator
              key={item.key}
              date={item.date}
              isDarkMode={isDarkMode}
            />
          ) : (
            <UpdateItem
              key={item.key}
              entry={item.entry}
              taskTitle={taskTitleMap[item.entry.taskId]}
              isDarkMode={isDarkMode}
              users={users}
              onClick={() => onUpdateClick(item.entry.taskId)}
            />
          )
        )}
      </div>
    </div>
  );
};
