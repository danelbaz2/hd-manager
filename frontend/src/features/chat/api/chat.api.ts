// Chat API - handles all chat message-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "@api/apiConfig";
import type { ChatMessage, ChatMessageFormData } from "../types/chat.types";

const CHAT_MESSAGES_ENDPOINT = `${API_BASE_URL}/chat-messages`;

/**
 * Get all chat messages (sorted chronologically)
 */
export const getAllChatMessages = async (): Promise<ApiResponse<ChatMessage[]>> => {
  return apiRequest<ChatMessage[]>(`${CHAT_MESSAGES_ENDPOINT}/`);
};

/**
 * Create a new chat message
 */
export const createChatMessage = async (
  messageData: ChatMessageFormData
): Promise<ApiResponse<ChatMessage>> => {
  const response = await apiRequest<ChatMessage>(`${CHAT_MESSAGES_ENDPOINT}/`, {
    method: "POST",
    body: JSON.stringify(messageData),
  });

  if (response.success) {
    response.message = "Chat message created successfully";
  }

  return response;
};
