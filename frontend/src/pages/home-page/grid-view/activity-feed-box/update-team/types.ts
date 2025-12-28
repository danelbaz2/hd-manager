// Types for the Update Team component
import type { UserData } from "../../../../../schemas/userTypes";

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
}

export interface MessageItemProps {
  message: TeamMessage;
  sender?: UserData;
  isDarkMode: boolean;
}

export interface MessageInputProps {
  isDarkMode: boolean;
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
}
