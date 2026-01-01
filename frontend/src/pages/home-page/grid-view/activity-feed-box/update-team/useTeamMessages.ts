import { useState, useCallback, useEffect } from "react";
import { getAllChatMessages, createChatMessage } from "../../../../../api/chatApi";
import type { TeamMessage } from "../../../../../schemas/teamMessageTypes";
import { useAuth } from "../../../../../contexts/AuthContext";

export const useTeamMessages = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllChatMessages();
      if (response.success && response.data) {
        // Map to TeamMessage format and sort newest first
        const mapped: TeamMessage[] = response.data.map((msg) => ({
          id: msg.id,
          content: msg.message || "",
          senderId: msg.senderUserId || "",
          base: msg.base,
        }));
        // Sort descending (newest first)
        mapped.sort((a, b) => (b.base?.createdAt || 0) - (a.base?.createdAt || 0));
        setMessages(mapped);
      } else {
        setError(response.error || "Failed to load messages");
      }
    } catch (e) {
      setError("Network error");
      console.error("Failed to fetch messages:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a new message - optimistic update + API call
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!content.trim()) return;
    setIsSending(true);
    setError(null);

    // Create optimistic message
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: TeamMessage = {
      id: optimisticId,
      content: content.trim(),
      senderId,
      base: {
        createdAt: Date.now(),
        createdBy: senderId,
      },
    };

    // Add to messages immediately (optimistic update)
    setMessages((prev) => [optimisticMessage, ...prev]);

    try {
      const response = await createChatMessage({ message: content, senderUserId: senderId });
      if (response.success) {
        // Refetch to get the real message with proper ID and sync with server
        await fetchMessages();
      } else {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setError(response.error || "Failed to send message");
      }
    } catch (e) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError("Failed to send message");
      console.error("Error sending message:", e);
    } finally {
      setIsSending(false);
    }
  }, [fetchMessages]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [fetchMessages, isAuthenticated]);

  return { messages, isLoading, isSending, error, fetchMessages, sendMessage };
};
