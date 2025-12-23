/**
 * HistoryTimeline - Displays task history with timeline and chat input
 */
import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { TaskHistoryEntry } from "../../../api/tasksApi";
import type { UserData } from "../../../schemas/userTypes";
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
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const prevLengthRef = useRef(history.length);
  const waitingForNewEntry = useRef(false);
  const isInitialMount = useRef(true);

  // Get user by name
  const getUserByName = (name: string): UserData | undefined => {
    return users.find((u) => u.fullName === name);
  };

  // Initial scroll to bottom (instant, no animation)
  useEffect(() => {
    if (scrollRef.current && isInitialMount.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      isInitialMount.current = false;
    }
  }, []);

  // Handle history changes - smooth scroll only on new entries
  useEffect(() => {
    // If we're waiting for a new entry and history grew, animate the NEW entry
    if (waitingForNewEntry.current && history.length > prevLengthRef.current) {
      const newEntry = history[history.length - 1];
      if (newEntry?.id) {
        setNewEntryId(newEntry.id);
        setTimeout(() => setNewEntryId(null), 1000);
      }
      waitingForNewEntry.current = false;

      // Smooth scroll only for new entries
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }

    prevLengthRef.current = history.length;
  }, [history]);

  // Handle note submission
  const handleAddNote = async (text: string) => {
    waitingForNewEntry.current = true;
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
                isNew={entry.id === newEntryId}
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
