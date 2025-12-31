/**
 * ChatInput - Chat-like input with mention support.
 * Uses ChatInputUI for rendering and useMention for mention functionality.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Contact } from "../../../../api/contactsApi";
import { useMention } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/useMention";
import { MentionList } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/MentionList";
import { normalizeMentionSpacing } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/MentionText";
import ChatInputUI from "./ChatInputUI";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  isDarkMode: boolean;
  contacts: Contact[];
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isDarkMode,
  contacts,
  placeholder = "כתוב עדכון...",
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionPosition, setMentionPosition] = useState<{ top: number; right: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mentionState,
    filteredContacts,
    selectedIndex,
    handleInputChange,
    handleKeyDown: mentionKeyDown,
    handleSelectContact,
    resetMention,
  } = useMention(contacts);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Update mention position when active
  useEffect(() => {
    if (mentionState.isActive && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMentionPosition({ top: rect.top, right: rect.right });
    } else {
      setMentionPosition(null);
    }
  }, [mentionState.isActive]);

  const handleSend = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const validNames = contacts.map(c => c.fullName);
      await onSend(normalizeMentionSpacing(text.trim(), validNames));
      setText("");
      resetMention();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      handleInputChange(e.target.value, e.target.selectionStart || 0);
    },
    [handleInputChange]
  );

  const handleContactSelect = useCallback(
    (contact: Contact) => {
      const name = handleSelectContact(contact);
      const before = text.slice(0, mentionState.startPosition);
      const after = text.slice(mentionState.cursorPosition).trimStart();
      setText(`${before}@${name} ${after}`);

      setTimeout(() => {
        if (inputRef.current) {
          const pos = mentionState.startPosition + name.length + 2;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(pos, pos);
        }
      }, 0);
    },
    [text, mentionState, handleSelectContact]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState.isActive && filteredContacts.length > 0) {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleContactSelect(filteredContacts[selectedIndex]);
        return;
      }
      if (mentionKeyDown(e)) return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {mentionState.isActive && mentionPosition && (
        <MentionList
          contacts={filteredContacts}
          searchQuery={mentionState.searchQuery}
          isDarkMode={isDarkMode}
          selectedIndex={selectedIndex}
          onSelect={handleContactSelect}
          isLoading={false}
          position={mentionPosition}
        />
      )}
      <ChatInputUI
        ref={inputRef}
        text={text}
        isDarkMode={isDarkMode}
        isSubmitting={isSubmitting}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => resetMention(), 200)}
        onSend={handleSend}
      />
    </div>
  );
};

export default ChatInput;
