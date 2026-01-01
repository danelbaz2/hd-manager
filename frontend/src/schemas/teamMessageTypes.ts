// Types for team messages and related components
import type { UserData } from "./userTypes";
import type { Contact } from "../api/contactsApi";

export interface TeamMessage {
  id: string;
  content: string;
  senderId: string;
  base?: {
    createdAt: number;
    createdBy?: string;
    updatedAt?: number;
    entityType?: string;
    isDeleted?: boolean;
  };
}

export interface UpdateTeamProps {
  users: UserData[];
  isDarkMode: boolean;
  currentUserId?: string;
  messagesOverride?: TeamMessage[];
}

export interface MessageItemProps {
  message: TeamMessage;
  sender?: UserData;
  isDarkMode: boolean;
  onMentionClick?: (contactName: string) => void;
  /** Valid contact names for proper mention parsing */
  validContactNames?: string[];
}

export interface MessageInputProps {
  isDarkMode: boolean;
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
  contacts: Contact[];
  contactsLoading?: boolean;
}
