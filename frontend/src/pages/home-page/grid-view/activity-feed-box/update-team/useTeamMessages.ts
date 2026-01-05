import { useCallback } from "react";
import { useChatMessagesQuery, useCreateChatMessageMutation } from "../../../../../api/queries";
import type { TeamMessage } from "../../../../../schemas/teamMessageTypes";
import { useChatSync } from "../../../../../socket/hooks/useChatSync";
import { queryClient, chatKeys } from "../../../../../api/queries";

export const useTeamMessages = () => {
  // Use React Query for fetching messages
  const { 
    data: rawMessages, 
    isLoading, 
    error: queryError,
    refetch 
  } = useChatMessagesQuery();

  // Transform to TeamMessage format and sort
  const messages: TeamMessage[] = (rawMessages || [])
    .map((msg) => ({
      id: msg.id,
      content: msg.message || "",
      senderId: msg.senderUserId || "",
      base: msg.base,
    }))
    .sort((a, b) => (b.base?.createdAt || 0) - (a.base?.createdAt || 0));

  // Use mutation for sending messages
  const createMutation = useCreateChatMessageMutation();

  // Subscribe to WebSocket updates - invalidate query when new messages arrive
  // Disable during mutation to prevent double-fetch (mutation already invalidates)
  useChatSync(() => {
    queryClient.invalidateQueries({ queryKey: chatKeys.messages });
  }, { enabled: !createMutation.isPending });

  // Send a new message with optimistic update
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!content.trim()) return;

    // Create optimistic message ID for rollback
    const optimisticId = `temp-${Date.now()}`;

    // Optimistic update - add to cache immediately
    queryClient.setQueryData(chatKeys.messages, (old: typeof rawMessages) => {
      if (!old) return [{ 
        id: optimisticId, 
        message: content.trim(), 
        senderUserId: senderId,
        base: { createdAt: Date.now(), updatedAt: Date.now(), lut: Date.now(), entityType: 'chat', isDeleted: false }
      }];
      return [{ 
        id: optimisticId, 
        message: content.trim(), 
        senderUserId: senderId,
        base: { createdAt: Date.now(), updatedAt: Date.now(), lut: Date.now(), entityType: 'chat', isDeleted: false }
      }, ...old];
    });

    try {
      await createMutation.mutateAsync({ message: content.trim(), senderUserId: senderId });
      // Mutation onSuccess will invalidate and refetch
    } catch (e) {
      // Remove optimistic message on error
      queryClient.setQueryData(chatKeys.messages, (old: typeof rawMessages) => {
        if (!old) return [];
        return old.filter((m) => m.id !== optimisticId);
      });
      console.error("Error sending message:", e);
    }
  }, [createMutation]);

  // Backward compatible fetchMessages (just refetch)
  const fetchMessages = useCallback(() => {
    refetch();
  }, [refetch]);

  return { 
    messages, 
    isLoading, 
    isSending: createMutation.isPending, 
    error: queryError?.message || null, 
    fetchMessages, 
    sendMessage 
  };
};
