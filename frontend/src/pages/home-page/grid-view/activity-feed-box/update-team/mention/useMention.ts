// Custom hook for mention functionality
import { useState, useCallback, useMemo } from "react";
import type { Contact } from "../../../../../../api/contactsApi";
import type { MentionState, UseMentionReturn } from "../../../../../../schemas/mentionTypes";

const INITIAL_STATE: MentionState = {
  isActive: false,
  searchQuery: "",
  cursorPosition: 0,
  startPosition: 0,
};

export const useMention = (contacts: Contact[]): UseMentionReturn => {
  const [mentionState, setMentionState] = useState<MentionState>(INITIAL_STATE);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!mentionState.isActive) return [];
    const query = mentionState.searchQuery.toLowerCase();
    return contacts.filter((contact) =>
      contact.fullName.toLowerCase().includes(query)
    );
  }, [contacts, mentionState.isActive, mentionState.searchQuery]);

  // Handle input changes and detect @ symbol
  const handleInputChange = useCallback(
    (value: string, cursorPos: number) => {
      const textBeforeCursor = value.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Check if there's no space between @ and cursor
        if (!textAfterAt.includes(" ")) {
          setMentionState({
            isActive: true,
            searchQuery: textAfterAt,
            cursorPosition: cursorPos,
            startPosition: lastAtIndex,
          });
          setSelectedIndex(0);
          return;
        }
      }
      setMentionState(INITIAL_STATE);
    },
    []
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!mentionState.isActive || filteredContacts.length === 0) {
        return false;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          // Stop at the end, don't wrap around
          setSelectedIndex((prev) =>
            prev < filteredContacts.length - 1 ? prev + 1 : prev
          );
          return true;
        case "ArrowUp":
          e.preventDefault();
          // Stop at the beginning, don't wrap around
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : prev
          );
          return true;
        case "Enter":
        case "Tab":
          e.preventDefault();
          return true;
        case "Escape":
          e.preventDefault();
          setMentionState(INITIAL_STATE);
          return true;
        default:
          return false;
      }
    },
    [mentionState.isActive, filteredContacts.length]
  );

  // Handle contact selection and return new content
  const handleSelectContact = useCallback(
    (contact: Contact): string => {
      setMentionState(INITIAL_STATE);
      return contact.fullName;
    },
    []
  );

  const resetMention = useCallback(() => {
    setMentionState(INITIAL_STATE);
    setSelectedIndex(0);
  }, []);

  return {
    mentionState,
    filteredContacts,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    handleSelectContact,
    resetMention,
  };
};
