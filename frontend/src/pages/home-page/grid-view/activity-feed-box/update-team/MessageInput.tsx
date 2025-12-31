import React, { useState, useCallback, useRef } from "react";
import { Send } from "lucide-react";
import type { MessageInputProps } from "../../../../../schemas/teamMessageTypes";
import { useMention, MentionList, normalizeMentionSpacing } from "./mention";

export const MessageInput: React.FC<MessageInputProps> = ({
  isDarkMode,
  onSend,
  isLoading,
  contacts,
  contactsLoading = false,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    mentionState,
    filteredContacts,
    selectedIndex,
    handleInputChange,
    handleKeyDown: mentionKeyDown,
    handleSelectContact,
    resetMention,
  } = useMention(contacts);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || isLoading) return;
      // Normalize spacing around mentions before sending
      const validNames = contacts.map(c => c.fullName);
      const normalizedContent = normalizeMentionSpacing(content.trim(), validNames);
      await onSend(normalizedContent);
      setContent("");
      resetMention();
    },
    [content, isLoading, onSend, resetMention, contacts]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      setContent(newValue);
      handleInputChange(newValue, cursorPos);
    },
    [handleInputChange]
  );

  const handleContactSelect = useCallback(
    (contact: (typeof contacts)[0]) => {
      const contactName = handleSelectContact(contact);
      const before = content.slice(0, mentionState.startPosition);
      const after = content.slice(mentionState.cursorPosition);

      // Always add a space after the mention, trim any leading space from 'after'
      // to prevent double spaces
      const trimmedAfter = after.trimStart();
      const newContent = `${before}@${contactName} ${trimmedAfter}`;
      setContent(newContent);

      // Focus back on textarea
      setTimeout(() => {
        if (textareaRef.current) {
          // +2 for @ and the space after the name
          const newPos = mentionState.startPosition + contactName.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [content, mentionState, handleSelectContact]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle mention keyboard events first
      if (mentionState.isActive && filteredContacts.length > 0) {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          handleContactSelect(filteredContacts[selectedIndex]);
          return;
        }
        if (mentionKeyDown(e)) return;
      }

      // Normal Enter submit
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [
      mentionState.isActive,
      filteredContacts,
      selectedIndex,
      handleContactSelect,
      mentionKeyDown,
      handleSubmit,
    ]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-end gap-2 p-3 border-t ${isDarkMode
        ? "border-slate-700 bg-slate-800"
        : "border-slate-200 bg-white"
        }`}
      dir="rtl"
    >
      {/* Mention Dropdown */}
      {mentionState.isActive && (
        <MentionList
          contacts={filteredContacts}
          searchQuery={mentionState.searchQuery}
          isDarkMode={isDarkMode}
          selectedIndex={selectedIndex}
          onSelect={handleContactSelect}
          isLoading={contactsLoading}
        />
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Delay to allow click on MentionList item before closing
          setTimeout(() => resetMention(), 150);
        }}
        placeholder="כתוב עדכון לצוות... (@ לאזכור)"
        rows={1}
        className={`flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isDarkMode
          ? "bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          : "bg-slate-100 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-400"
          }`}
        style={{ minHeight: "40px", maxHeight: "100px" }}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!content.trim() || isLoading}
        className={`p-2.5 rounded-xl transition-all ${content.trim() && !isLoading
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
          : isDarkMode
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
      >
        <Send className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
      </button>
    </form>
  );
};
