import React, { useCallback, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { useTeamMessages } from "./useTeamMessages";
import { useChatUpdates } from "../../../../../contexts";
import { useContacts } from "./mention";
import { ContactDetailModal } from "../../../../../components/modal/modal-contact-detail";
import { ScrollToLatestButton } from "../../../../../components/common/ScrollToLatestButton";
import type {
  UpdateTeamProps,
  TeamMessage,
} from "../../../../../schemas/teamMessageTypes";

export const UpdateTeam: React.FC<UpdateTeamProps> = ({
  users,
  isDarkMode,
  currentUserId,
  isAdmin,
  messagesOverride,
}) => {
  // ... hooks
  const {
    messages: apiMessages,
    isLoading: apiLoading,
    isSending,
    error: apiError,
    fetchMessages,
    sendMessage,
  } = useTeamMessages();

  const {
    contacts,
    isLoading: contactsLoading,
    selectedContact,
    setSelectedContact,
    findContactByName,
  } = useContacts();

  const messages = messagesOverride || apiMessages;
  const isLoading = messagesOverride ? false : apiLoading;
  const error = messagesOverride ? null : apiError;

  const scrollerRef = useRef<HTMLElement>(null);

  // Subscribe to real-time chat updates via WebSocket
  useChatUpdates(fetchMessages, !messagesOverride);

  const getSender = useCallback(
    (senderId: string) => users.find((u) => u.id === senderId),
    [users]
  );
  // ... handlers

  const handleSend = useCallback(
    async (content: string) => {
      if (currentUserId) await sendMessage(content, currentUserId);
    },
    [currentUserId, sendMessage]
  );

  const handleMentionClick = useCallback(
    (contactName: string) => {
      const contact = findContactByName(contactName);
      if (contact) setSelectedContact(contact);
    },
    [findContactByName, setSelectedContact]
  );

  const renderMessage = useCallback(
    (_i: number, msg: TeamMessage) => (
      <MessageItem
        key={msg.id}
        message={msg}
        sender={getSender(msg.senderId)}
        isDarkMode={isDarkMode}
        onMentionClick={handleMentionClick}
      />
    ),
    [getSender, isDarkMode, handleMentionClick]
  );

  const inputProps = {
    isDarkMode,
    onSend: handleSend,
    isLoading: isSending,
    contacts,
    contactsLoading,
  };
  const modalProps = {
    contact: selectedContact,
    isOpen: !!selectedContact,
    onClose: () => setSelectedContact(null),
    isDarkMode,
  };

  if (isLoading && messages.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center text-sm 
                       ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        טוען עדכונים...
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-500">
        שגיאה: {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div
          className={`flex-1 flex items-center justify-center text-sm 
                         ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          אין עדכוני צוות עדיין
        </div>
        {isAdmin && <MessageInput {...inputProps} />}
        <ContactDetailModal {...modalProps} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <Virtuoso
          data={messages}
          itemContent={renderMessage}
          className={`h-full ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
            }`}
          style={{ height: "100%" }}
          overscan={200}
          scrollerRef={(ref) => {
            if (ref) (scrollerRef as React.MutableRefObject<HTMLElement | null>).current = ref as HTMLElement;
          }}
        />
        <ScrollToLatestButton containerRef={scrollerRef} direction="up" />
      </div>
      {isAdmin && <MessageInput {...inputProps} />}
      <ContactDetailModal {...modalProps} />
    </div>
  );
};
