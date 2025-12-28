import { useState, useCallback, useEffect } from "react";
import { getAllChatMessages, createChatMessage } from "../../../../../api/chatApi";
import type { TeamMessage } from "./types";

export const useTeamMessages = () => {
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

  // Send a new message
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!content.trim()) return;
    setIsSending(true);
    try {
      const response = await createChatMessage({ message: content, senderUserId: senderId });
      if (response.success) {
        // Refetch to get the new message with proper formatting
        await fetchMessages();
      } else {
        setError(response.error || "Failed to send message");
      }
    } catch (e) {
      setError("Failed to send message");
      console.error("Error sending message:", e);
    } finally {
      setIsSending(false);
    }
  }, [fetchMessages]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, isLoading, isSending, error, fetchMessages, sendMessage };
};
