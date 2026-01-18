/**
 * Chat Types
 */

// Chat Message base (metadata fields)
export interface ChatMessageBase {
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  lut: number;
  entityType: string;
}

// Chat Message interface (from API response)
export interface ChatMessage {
  id: string;
  senderUserId?: string;
  message?: string;
  base?: ChatMessageBase;
}

// Form data for creating messages
export interface ChatMessageFormData {
  senderUserId: string;
  message: string;
}
