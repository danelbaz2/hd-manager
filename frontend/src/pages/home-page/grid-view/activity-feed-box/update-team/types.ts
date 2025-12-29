// Types for the Update Team component
import type { UserData } from "../../../../../schemas/userTypes";
import type { Contact } from "../../../../../api/contactsApi";

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
  isAdmin: boolean;
  messagesOverride?: TeamMessage[];
}

export interface MessageItemProps {
  message: TeamMessage;
  sender?: UserData;
  isDarkMode: boolean;
  onMentionClick?: (contactName: string) => void;
}

export interface MessageInputProps {
  isDarkMode: boolean;
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
  contacts: Contact[];
  contactsLoading?: boolean;
}
