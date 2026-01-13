/**
 * HistoryTimeline - Displays task history with timeline and chat input
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import HistoryEntry from "./HistoryEntry";
import ChatInput from "./ChatInput";
import { type ActionConfigItem } from "./historyConfig";
import { ScrollToLatestButton } from "../../../../components/common/ScrollToLatestButton";
import type { Contact } from "../../../../api/contactsApi";

// Animation timing constants (in ms)
const ANIMATION_DURATION = 1000;
const ANIMATION_CLEANUP_DELAY = 1500;

interface HistoryTimelineProps {
  history: TaskHistoryEntry[];
  users: UserData[];
  contacts: Contact[];
  isDarkMode: boolean;
  isLoading: boolean;
  onAddNote: (text: string) => Promise<void>;
  getActionDescription: (
    entry: TaskHistoryEntry,
    config: ActionConfigItem
  ) => React.ReactNode;
  onMentionClick: (contactName: string) => void;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  history,
  users,
  contacts,
  isDarkMode,
  isLoading,
  onAddNote,
  getActionDescription,
  onMentionClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const prevHistoryLengthRef = useRef(history.length);

  // Get user by name
  const getUserByName = (name: string): UserData | undefined => {
    return users.find((u) => u.fullName === name);
  };

  /**
   * Smoothly scrolls to bottom, following content as it expands during animation
   */
  const scrollFollowingAnimation = useCallback(() => {
    if (!scrollRef.current) return;

    const startTime = performance.now();

    const followScroll = () => {
      if (!scrollRef.current) return;

      const elapsed = performance.now() - startTime;
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTop = scrollHeight - clientHeight;

      if (elapsed < ANIMATION_DURATION) {
        requestAnimationFrame(followScroll);
      }
    };

    // Small delay for DOM to update before starting
    setTimeout(() => requestAnimationFrame(followScroll), 50);
  }, []);

  // Scroll to bottom on mount (every time this component is rendered/tab is switched)
  useEffect(() => {
    if (scrollRef.current && history.length > 0) {
      const scrollToBottom = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      };

      // Use multiple attempts to ensure scroll happens after render
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
      const timer = setTimeout(scrollToBottom, 100);

      // Mark all entries as known on mount
      history.forEach((e) => knownIdsRef.current.add(e.id));
      isInitialMount.current = false;

      return () => clearTimeout(timer);
    }
  }, []); // Empty deps = run once on mount

  // Handle history changes - detect new entries and animate them
  useEffect(() => {
    if (isInitialMount.current) return;

    const historyGrew = history.length > prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = history.length;

    // Find entries we haven't seen before
    const newIds = history
      .filter((entry) => !knownIdsRef.current.has(entry.id))
      .map((entry) => {
        knownIdsRef.current.add(entry.id);
        return entry.id;
      });

    if (newIds.length > 0) {
      // Mark entries as new for animation
      setNewEntryIds((prev) => new Set([...prev, ...newIds]));

      // Clear animation status after completion
      setTimeout(() => {
        setNewEntryIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });
      }, ANIMATION_CLEANUP_DELAY);
    }

    // Scroll to follow new content
    if (historyGrew) {
      scrollFollowingAnimation();
    }
  }, [history, scrollFollowingAnimation]);

  // Handle note submission
  const handleAddNote = async (text: string) => {
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
            {history.map((entry, index) => {
              const isNew = newEntryIds.has(entry.id);
              // Check if the NEXT entry is new (so this entry's line should animate)
              const nextEntry = history[index + 1];
              const isBeforeNew = nextEntry ? newEntryIds.has(nextEntry.id) : false;
              
              return (
                <HistoryEntry
                  key={entry.id || index}
                  entry={entry}
                  isLast={index === history.length - 1}
                  isDarkMode={isDarkMode}
                  user={getUserByName(entry.updatedBy)}
                  getActionDescription={getActionDescription}
                  isNew={isNew}
                  isBeforeNew={isBeforeNew}
                  onMentionClick={onMentionClick}
                />
              );
            })}

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

      {/* Scroll to bottom button */}
      <ScrollToLatestButton
        containerRef={scrollRef}
        direction="down"
        className="bottom-20"
      />

      {/* Chat Input - Always visible */}
      <div
        className="relative z-10 pt-3 mt-auto border-t border-dashed"
        style={{ borderColor: isDarkMode ? "#475569" : "#CBD5E1" }}
      >
        <ChatInput
          onSend={handleAddNote}
          isDarkMode={isDarkMode}
          contacts={contacts}
          placeholder="כתוב עדכון או הערה..."
        />
      </div>
    </div>
  );
};

export default HistoryTimeline;
