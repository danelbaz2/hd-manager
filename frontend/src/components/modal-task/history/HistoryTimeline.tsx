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

  // Get user by name
  const getUserByName = (name: string): UserData | undefined => {
    return users.find((u) => u.fullName === name);
  };

  // Scroll to bottom on new entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  // Handle note submission with animation
  const handleAddNote = async (text: string) => {
    await onAddNote(text);
    // Set the latest entry as new for animation
    if (history.length > 0) {
      const latestId = history[history.length - 1]?.id;
      if (latestId) {
        setNewEntryId(latestId);
        setTimeout(() => setNewEntryId(null), 1000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2
          className={`w-6 h-6 animate-spin ${
            isDarkMode ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Timeline with scroll */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto pl-2 hidden-scrollbar min-h-0"
        style={{ direction: "ltr" }}
      >
        <div style={{ direction: "rtl" }}>
          {/* History entries */}
          <div className="space-y-0 pb-2">
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
                className={`text-center text-sm py-8 ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
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
        className="pt-3 mt-auto border-t border-dashed"
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
