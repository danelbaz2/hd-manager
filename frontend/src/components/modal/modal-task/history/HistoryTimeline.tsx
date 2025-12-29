/**
 * HistoryTimeline - Displays task history with timeline and chat input
 */
import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import HistoryEntry from "./HistoryEntry";
import ChatInput from "./ChatInput";
import { type ActionConfigItem } from "./historyConfig";

interface HistoryTimelineProps {
  history: TaskHistoryEntry[];
  users: UserData[];
  isDarkMode: boolean;
  isLoading: boolean;
  onAddNote: (text: string) => Promise<void>;
  getActionDescription: (
    entry: TaskHistoryEntry,
    config: ActionConfigItem
  ) => React.ReactNode;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  history,
  users,
  isDarkMode,
  isLoading,
  onAddNote,
  getActionDescription,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const pendingOwnEntryRef = useRef(false); // Track if we're expecting our own entry

  // Get user by name
  const getUserByName = (name: string): UserData | undefined => {
    return users.find((u) => u.fullName === name);
  };

  // Initial scroll to bottom (instant, no animation)
  useEffect(() => {
    if (scrollRef.current && isInitialMount.current && history.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      // Mark all initial entries as known
      history.forEach((e) => knownIdsRef.current.add(e.id));
      isInitialMount.current = false;
    }
  }, [history]);

  // Handle history changes - detect new entries and animate them
  const prevHistoryLengthRef = useRef(history.length);

  useEffect(() => {
    if (isInitialMount.current) return;

    // Detect if history grew
    const historyGrew = history.length > prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = history.length;

    // Find entries we haven't seen before
    const newIds: string[] = [];
    history.forEach((entry) => {
      if (!knownIdsRef.current.has(entry.id)) {
        // If we're expecting our own entry, mark it as known but don't animate
        if (pendingOwnEntryRef.current) {
          knownIdsRef.current.add(entry.id);
          pendingOwnEntryRef.current = false;
        } else {
          // This is from someone else - animate it
          newIds.push(entry.id);
          knownIdsRef.current.add(entry.id);
        }
      }
    });

    if (newIds.length > 0) {
      // Mark these entries as new for animation
      setNewEntryIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });

      // Remove "new" status after animation completes
      setTimeout(() => {
        setNewEntryIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 1500);
    }

    // Smooth scroll to bottom whenever history grows (own entries or from others)
    if (historyGrew && scrollRef.current) {
      // Use requestAnimationFrame for smoother scrolling after DOM update
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [history]);

  // Handle note submission - mark that we're expecting our own entry
  const handleAddNote = async (text: string) => {
    pendingOwnEntryRef.current = true;
    await onAddNote(text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2
          className={`w-6 h-6 animate-spin ${isDarkMode ? "text-blue-400" : "text-blue-500"
            }`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-visible">
      {/* Timeline with scroll */}
      <div
        ref={scrollRef}
        className="relative z-20 flex-1 overflow-y-auto overflow-x-visible pl-2 pr-1 hidden-scrollbar min-h-0"
        style={{ direction: "ltr" }}
      >
        <div style={{ direction: "rtl" }} className="pr-2">
          {/* History entries */}
          <div className="space-y-0 pb-6">
            {history.map((entry, index) => (
              <HistoryEntry
                key={entry.id || index}
                entry={entry}
                isLast={index === history.length - 1}
                isDarkMode={isDarkMode}
                user={getUserByName(entry.updatedBy)}
                getActionDescription={getActionDescription}
                isNew={newEntryIds.has(entry.id)}
              />
            ))}

            {history.length === 0 && (
              <p
                className={`text-center text-sm py-8 ${isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                אין היסטוריה עדיין
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Input - Always visible */}
      <div
        className="relative z-10 pt-3 mt-auto border-t border-dashed"
        style={{ borderColor: isDarkMode ? "#475569" : "#CBD5E1" }}
      >
        <ChatInput
          onSend={handleAddNote}
          isDarkMode={isDarkMode}
          placeholder="כתוב עדכון או הערה..."
        />
      </div>
    </div>
  );
};

export default HistoryTimeline;
