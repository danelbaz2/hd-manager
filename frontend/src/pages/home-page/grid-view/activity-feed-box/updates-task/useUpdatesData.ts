import { useState, useCallback } from "react";
import { getAllTasksHistory, type TaskHistoryEntry } from "../../../../../api/tasksApi";

// Get start/end of day helpers
const getStartOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const getEndOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

interface UseUpdatesDataOptions {
  selectedDate: number;
}

export const useUpdatesData = ({ selectedDate }: UseUpdatesDataOptions) => {
  const [updates, setUpdates] = useState<TaskHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch updates for the selected date
  const fetchUpdates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dayStart = getStartOfDay(selectedDate);
      const dayEnd = getEndOfDay(selectedDate);

      const response = await getAllTasksHistory({
        limit: 200, // Get plenty of updates
        before: dayEnd + 1,
        after: dayStart - 1,
      });

      if (response.success && response.data) {
        // Filter to selected date and sort oldest first
        const filtered = response.data
          .filter((u) => u.timestamp >= dayStart && u.timestamp <= dayEnd)
          .sort((a, b) => a.timestamp - b.timestamp);
        setUpdates(filtered);
      } else {
        setError(response.error || "Failed to load updates");
      }
    } catch (e) {
      setError("Network error");
      console.error("Failed to fetch updates:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Add a new update (from WebSocket)
  const addUpdate = useCallback((update: TaskHistoryEntry) => {
    const dayStart = getStartOfDay(selectedDate);
    const dayEnd = getEndOfDay(selectedDate);

    // Only add if it's for the selected date
    if (update.timestamp >= dayStart && update.timestamp <= dayEnd) {
      setUpdates((prev) => {
        // Check if already exists
        if (prev.some((u) => u.id === update.id)) return prev;
        // Add and sort
        return [...prev, update].sort((a, b) => a.timestamp - b.timestamp);
      });
    }
  }, [selectedDate]);

  return { updates, isLoading, error, fetchUpdates, addUpdate };
};
