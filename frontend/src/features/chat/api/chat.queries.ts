/**
 * Chat Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllChatMessages, createChatMessage } from "./chat.api";
import type { ChatMessage, ChatMessageFormData } from "../types/chat.types";
import { queryKeys, queryClient as globalQueryClient } from "@api/queryClient";
import { useAuth } from "@features/auth";

export const useChatMessagesQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.chatMessages.all,
    queryFn: async () => {
      const response = await getAllChatMessages();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch chat messages");
    },
    enabled: !!isAuthenticated,
  });
};

export const useCreateChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: ChatMessageFormData) => {
      const response = await createChatMessage(message);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create chat message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages.all });
    },
  });
};

/**
 * Invalidate chat queries (for WebSocket updates)
 */
export const invalidateChatQueries = () => {
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.chatMessages.all });
};

export type { ChatMessage, ChatMessageFormData };
