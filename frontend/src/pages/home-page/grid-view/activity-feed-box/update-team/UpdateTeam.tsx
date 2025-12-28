import React, { useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { useTeamMessages } from "./useTeamMessages";
import { useSocket } from "../../../../../contexts";
import type { UpdateTeamProps, TeamMessage } from "./types";

export const UpdateTeam: React.FC<UpdateTeamProps> = ({
  users,
  isDarkMode,
  currentUserId,
  isAdmin,
}) => {
  const { messages, isLoading, isSending, error, fetchMessages, sendMessage } =
    useTeamMessages();

  // Subscribe to WebSocket for real-time updates
  const { subscribe, isConnected } = useSocket();
  React.useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = subscribe(() => fetchMessages());
    return unsubscribe;
  }, [isConnected, subscribe, fetchMessages]);

  // Find sender data for a message
  const getSender = useCallback(
    (senderId: string) => users.find((u) => u.id === senderId),
    [users]
  );

  // Handle send message
  const handleSend = useCallback(
    async (content: string) => {
      if (currentUserId) {
        await sendMessage(content, currentUserId);
      }
    },
    [currentUserId, sendMessage]
  );

  // Render message item for virtuoso
  const renderMessage = useCallback(
    (_index: number, msg: TeamMessage) => (
      <MessageItem
        key={msg.id}
        message={msg}
        sender={getSender(msg.senderId)}
        isDarkMode={isDarkMode}
      />
    ),
    [getSender, isDarkMode]
  );

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        טוען עדכונים...
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-500">
        שגיאה: {error}
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div
          className={`flex-1 flex items-center justify-center text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          אין עדכוני צוות עדיין
        </div>
        {isAdmin && (
          <MessageInput
            isDarkMode={isDarkMode}
            onSend={handleSend}
            isLoading={isSending}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Virtuoso
        data={messages}
        itemContent={renderMessage}
        className={`flex-1 ${
          isDarkMode ? "dark-scrollbar" : "light-scrollbar"
        }`}
        style={{ height: "100%" }}
        overscan={200}
      />
      {isAdmin && (
        <MessageInput
          isDarkMode={isDarkMode}
          onSend={handleSend}
          isLoading={isSending}
        />
      )}
    </div>
  );
};
