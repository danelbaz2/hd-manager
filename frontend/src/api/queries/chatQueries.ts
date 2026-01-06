/**
 * Chat Query Hooks
 * TanStack Query hooks for chat message management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllChatMessages,
  createChatMessage,
  type ChatMessage,
  type ChatMessageFormData,
} from "../chatApi";

// Query keys for chat
const chatKeys = {
  all: ["chat"] as const,
  messages: ["chat", "messages"] as const,
  mutations: {
    create: ["chat", "create"] as const,
  }
};

/**
 * Hook to fetch all chat messages
 */
export const useChatMessagesQuery = () => {
  return useQuery({
    queryKey: chatKeys.messages,
    queryFn: async () => {
      const response = await getAllChatMessages();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch chat messages");
    },
    // Data is fresh for 1 minute (server is source of truth, invalidate on socket event)
    staleTime: 60 * 1000,
    // Ensure we fetch if data is stale/invalidated when component mounts
    refetchOnMount: true,
  });
};

/**
 * Hook for creating a chat message
 */
export const useCreateChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: chatKeys.mutations.create,
    mutationFn: async (messageData: ChatMessageFormData) => {
      const response = await createChatMessage(messageData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create chat message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages });
    },
  });
};

/**
 * Invalidate chat queries (for WebSocket integration)
 */
export const invalidateChatQueries = () => {
  // This will be called from outside React components
  // Note: queryClient needs to be imported from queryClient.ts
};

// Re-export types
export type { ChatMessage, ChatMessageFormData };
export { chatKeys };
