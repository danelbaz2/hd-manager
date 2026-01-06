import { useCallback } from "react";
import { useChatMessagesQuery, useCreateChatMessageMutation } from "../../../../../api/queries";
import type { TeamMessage } from "../../../../../schemas/teamMessageTypes";
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
    .map((msg) => {
      // Normalize timestamp to ensure it's a number (backend might send ISO string)
      const rawCreatedAt = msg.base?.createdAt;
      const normalizedCreatedAt = typeof rawCreatedAt === "string"
        ? new Date(rawCreatedAt).getTime()
        : (Number(rawCreatedAt) || 0);

      return {
        id: msg.id,
        content: msg.message || "",
        senderId: msg.senderUserId || "",
        base: {
          ...msg.base,
          // Force numeric timestamp for correct sorting/latestTime calculation
          createdAt: normalizedCreatedAt,
        },
      };
    })
    .sort((a, b) => (b.base?.createdAt || 0) - (a.base?.createdAt || 0));

  // Use mutation for sending messages
  const createMutation = useCreateChatMessageMutation();

  // Note: WebSocket updates are now handled globally by ChatContext/socketIntegration
  // to ensure updates are received even when this component is unmounted.

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
