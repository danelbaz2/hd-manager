/**
 * ChatInput - Chat-like input for adding notes with send animation and mention support.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import type { Contact } from "../../../../api/contactsApi";
import { useMention } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/useMention";
import { MentionList } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/MentionList";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize mention hook
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
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSend(text.trim());
      setText("");
      resetMention();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      setText(newValue);
      handleInputChange(newValue, cursorPos);
    },
    [handleInputChange]
  );

  const handleContactSelect = useCallback(
    (contact: Contact) => {
      const contactName = handleSelectContact(contact);
      const before = text.slice(0, mentionState.startPosition);
      const after = text.slice(mentionState.cursorPosition);
      const newContent = `${before}@${contactName} ${after}`;
      setText(newContent);

      // Focus back and set cursor
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = mentionState.startPosition + contactName.length + 2;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [text, mentionState, handleSelectContact]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention navigation
    if (mentionState.isActive && filteredContacts.length > 0) {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleContactSelect(filteredContacts[selectedIndex]);
        return;
      }
      if (mentionKeyDown(e)) return;
    }

    // Handle submit
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Mention List Dropdown - Popups Upwards */}
      {mentionState.isActive && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
          <MentionList
            contacts={filteredContacts}
            searchQuery={mentionState.searchQuery}
            isDarkMode={isDarkMode}
            selectedIndex={selectedIndex}
            onSelect={handleContactSelect}
            isLoading={false}
          />
        </div>
      )}

      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200
          ${isDarkMode
            ? "bg-slate-700/60 border-slate-600"
            : "bg-white border-slate-200"
          }
          focus-within:border-blue-500
          focus-within:ring-2 focus-within:ring-blue-500/20
        `}
      >
        {/* Text Input */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay closing to allow click on mention item
            setTimeout(() => resetMention(), 200);
          }}
          placeholder={placeholder}
          rows={1}
          className={`
            flex-1 resize-none text-sm leading-normal
            bg-transparent border-none outline-none
            ${isDarkMode
              ? "text-white placeholder-slate-400"
              : "text-slate-800 placeholder-slate-400"
            }
          `}
          style={{ minHeight: "22px", maxHeight: "80px" }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSubmitting}
          className={`
            shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${!text.trim() || isSubmitting
              ? isDarkMode
                ? "bg-slate-600/50 text-slate-500 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
            }
          `}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
