// Chat API - handles all chat message-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Chat Message interfaces
export interface ChatMessageBase {
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  lut: number;
  entityType: string;
}

export interface ChatMessage {
  entityId: string;
  content?: string;
  senderId?: string;
  receiverId?: string;
  base?: ChatMessageBase;
}

export interface ChatMessageFormData {
  content?: string;
  senderId?: string;
  receiverId?: string;
}

/**
 * Get all chat messages (sorted chronologically)
 */
export const getAllChatMessages = async (): Promise<ApiResponse<ChatMessage[]>> => {
  return apiRequest<ChatMessage[]>(`${API_ENDPOINTS.chatMessages}/`);
};

/**
 * Create a new chat message
 */
export const createChatMessage = async (
  messageData: ChatMessageFormData
): Promise<ApiResponse<ChatMessage>> => {
  const response = await apiRequest<ChatMessage>(`${API_ENDPOINTS.chatMessages}/`, {
    method: "POST",
    body: JSON.stringify(messageData),
  });

  if (response.success) {
    response.message = "Chat message created successfully";
  }

  return response;
};
