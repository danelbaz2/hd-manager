import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Archive } from "lucide-react";
import { useTheme } from "../../contexts";
import { type Task } from "../../api/tasksApi";
import { type UserData } from "../../schemas/userTypes";
import { type SecondaryTagData } from "../../schemas/tagTypes";
import { type ArchiveFilters } from "../../schemas/archiveTypes";
import ArchiveTaskRow from "./ArchiveTaskRow";

interface Props {
  tasks: Task[];
  users: UserData[];
  tags: SecondaryTagData[];
  filters: ArchiveFilters;
}

const ROW_HEIGHT = 80; // Approximate height of each row in pixels

const ListTaskArchive: React.FC<Props> = ({ tasks, users, tags, filters }) => {
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
      if (filters.endDate && t.date && t.date >= filters.endDate) return false;
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
        className={`p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${isDarkMode
          ? "border-slate-700 bg-slate-800/30"
          : "border-slate-200 bg-white"
          }`}
      >
        <div
          className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center ${isDarkMode
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
    <div className="transition-all duration-300">
      {/* Header */}
      <div
        className={`flex items-center gap-4 px-4 lg:px-5 py-3 rounded-t-xl border-b text-xs font-semibold uppercase tracking-wide ${isDarkMode
          ? "bg-slate-800/80 border-slate-700 text-slate-400"
          : "bg-slate-50 border-slate-200 text-slate-500"
          }`}
        dir="rtl"
      >
        <div className="w-1" />
        <div className="w-16 lg:w-20 text-center">ID</div>
        <div className="flex-1">תיאור משימה</div>
        <div className="w-20 lg:w-24 text-center">סטטוס</div>
        <div className="w-24 lg:w-28">תאריך</div>
        <div className="w-36 lg:w-44">משויך ל...</div>
      </div>

      {/* Virtualized List Container */}
      <div
        ref={parentRef}
        className={`rounded-b-xl overflow-auto max-h-[calc(100vh-220px)] border border-t-0 ${isDarkMode
          ? "border-slate-700 dark-scrollbar"
          : "border-slate-200 light-scrollbar"
          }`}
      >
        {/* Inner container with total height for scroll */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
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
                  tags={tags}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with count */}
      <div
        className={`mt-3 text-sm text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}
      >
        מציג {filtered.length} מתוך {tasks.length} משימות
      </div>
    </div>
  );
};

export default ListTaskArchive;
