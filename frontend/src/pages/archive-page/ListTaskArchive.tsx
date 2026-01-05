import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Archive } from "lucide-react";
import { useTheme } from "../../contexts";
import { type Task } from "../../api/tasksApi";
import { type UserData } from "../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
} from "../../schemas/tagTypes";
import { type ArchiveFilters } from "../../schemas/archiveTypes";
import ArchiveTaskRow from "./ArchiveTaskRow";
import { ScrollToLatestButton } from "../../components/common/ScrollToLatestButton";

interface Props {
  tasks: Task[];
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  filters: ArchiveFilters;
  onTaskClick?: (task: Task) => void;
}

const ROW_HEIGHT = 80; // Approximate height of each row in pixels

const ListTaskArchive: React.FC<Props> = ({
  tasks,
  users,
  primaryTags,
  secondaryTags,
  filters,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const result = tasks.filter((t) => {
      if (
        filters.title &&
        !t.title?.toLowerCase().includes(filters.title.toLowerCase())
      )
        return false;
      if (
        filters.taskId &&
        !t.id?.toLowerCase().includes(filters.taskId.toLowerCase())
      )
        return false;
      if (filters.startDate && t.date && t.date < filters.startDate)
        return false;
      // For end date, include tasks on the selected date by comparing with end of day
      if (filters.endDate && t.date) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (t.date > endOfDay.getTime()) return false;
      }
      // Tag filtering - if any tags are selected, task must have at least one matching tag
      if (filters.tagIds && filters.tagIds.length > 0) {
        const taskTagIds = [
          ...(t.primaryTagIds || []),
          ...(t.secondaryTagIds || []),
        ];
        const hasMatchingTag = filters.tagIds.some((filterTagId) =>
          taskTagIds.includes(filterTagId)
        );
        if (!hasMatchingTag) return false;
      }
      return true;
    });
    // Sort by date, newest first
    return result.sort((a, b) => (b.date || 0) - (a.date || 0));
  }, [tasks, filters]);

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10, // Render 10 extra items above/below viewport for smooth scrolling
  });

  if (filtered.length === 0) {
    return (
      <div
        className={`p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
          isDarkMode
            ? "border-slate-700 bg-slate-800/30"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center ${
            isDarkMode
              ? "bg-slate-800 text-slate-500"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Archive className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">אין פריטים להצגה</h3>
        <p className="opacity-60 max-w-sm">נסה לשנות את מסנני החיפוש</p>
      </div>
    );
  }

  return (
    <div className="transition-all duration-300 relative">
      {/* Header */}
      <div
        className={`flex items-center gap-4 px-4 lg:px-5 py-3 rounded-t-xl border-b text-xs font-semibold uppercase tracking-wide ${
          isDarkMode
            ? "bg-slate-800/80 border-slate-700 text-slate-400"
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}
        dir="rtl"
      >
        <div className="w-1" />
        <div className="w-16 lg:w-20 text-center">ID</div>
        <div className="flex-1 min-w-0">שם משימה</div>
        <div className="w-28 lg:w-32 text-center">תגיות</div>
        <div className="w-28 lg:w-32 text-center">סטטוס</div>
        <div className="w-24 lg:w-28 text-center">תאריך</div>
        <div className="w-32 lg:w-40">משויך ל...</div>
      </div>

      {/* Virtualized List Container */}
      <div
        ref={parentRef}
        className={`rounded-b-xl overflow-y-auto max-h-[calc(100vh-300px)] border border-t-0 ${
          isDarkMode
            ? "border-slate-700 dark-scrollbar"
            : "border-slate-200 light-scrollbar"
        }`}
        style={{
          overflowY:
            virtualizer.getTotalSize() > window.innerHeight - 300
              ? "auto"
              : "hidden",
        }}
      >
        {/* Inner container with total height for scroll */}
        <div
          style={{
            height: `${virtualizer.getTotalSize() + 10}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Only render visible items */}
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const task = filtered[virtualRow.index];
            return (
              <div
                key={task.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ArchiveTaskRow
                  task={task}
                  users={users}
                  primaryTags={primaryTags}
                  secondaryTags={secondaryTags}
                  onTaskClick={onTaskClick}
                />
              </div>
            );
          })}
        </div>
      </div>

      <ScrollToLatestButton
        containerRef={parentRef}
        direction="up"
        className="top-14"
      />

      {/* Footer with count */}
      <div
        className={`mt-3 text-sm text-center ${
          isDarkMode ? "text-slate-500" : "text-slate-400"
        }`}
      >
        מציג {filtered.length} מתוך {tasks.length} משימות
      </div>
    </div>
  );
};

export default React.memo(ListTaskArchive);
