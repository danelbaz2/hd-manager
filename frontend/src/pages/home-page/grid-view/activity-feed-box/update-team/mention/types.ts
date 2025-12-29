// Types for the mention system
import type { Contact } from "../../../../../../api/contactsApi";

export interface MentionState {
  isActive: boolean;
  searchQuery: string;
  cursorPosition: number;
  startPosition: number;
}

export interface MentionListProps {
  contacts: Contact[];
  searchQuery: string;
  isDarkMode: boolean;
  selectedIndex: number;
  onSelect: (contact: Contact) => void;
  isLoading: boolean;
}

export interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export interface UseMentionReturn {
  mentionState: MentionState;
  filteredContacts: Contact[];
  selectedIndex: number;
  handleInputChange: (value: string, cursorPos: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  handleSelectContact: (contact: Contact) => string;
  resetMention: () => void;
}
