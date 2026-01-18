/**
 * Chat Feature Module
 * Exports all chat-related functionality
 */

// Types
export type {
  ChatMessage,
  ChatMessageBase,
  ChatMessageFormData,
} from "./types/chat.types";

// API
export {
  getAllChatMessages,
  createChatMessage,
} from "./api/chat.api";

// Query hooks
export {
  useChatMessagesQuery,
  useCreateChatMessageMutation,
  invalidateChatQueries,
} from "./api/chat.queries";
