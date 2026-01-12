import React, { useCallback, useRef, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { useTeamMessages } from "./useTeamMessages";
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
  messagesOverride,
  lastSeen = 0,
}) => {
  // ... hooks
  const {
    messages: apiMessages,
    isLoading: apiLoading,
    isSending,
    error: apiError,
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

  const getSender = useCallback(
    (senderId: string) => users.find((u) => u.id === senderId),
    [users]
  );

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content, currentUserId || "");
      // Scroll to top (newest) after sending
      if (scrollerRef.current) {
        // give it a moment to render
        setTimeout(() => {
          scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    },
    [sendMessage, currentUserId]
  );

  const handleMentionClick = useCallback(
    (contactName: string) => {
      // Toggle: if clicking the same contact name, close the modal
      if (selectedContact?.fullName.toLowerCase().trim() === contactName.toLowerCase().trim()) {
        setSelectedContact(null);
        return;
      }
      // Otherwise find and open the contact
      const contact = findContactByName(contactName);
      if (contact) {
        setSelectedContact(contact);
      }
    },
    [findContactByName, setSelectedContact, selectedContact?.fullName]
  );

  // Extract valid contact names for mention parsing
  const validContactNames = useMemo(
    () => contacts.map(c => c.fullName),
    [contacts]
  );

  const renderMessage = useCallback(
    (_i: number, msg: TeamMessage) => (
      <MessageItem
        key={msg.id}
        message={msg}
        sender={getSender(msg.senderId)}
        isDarkMode={isDarkMode}
        onMentionClick={handleMentionClick}
        validContactNames={validContactNames}
        lastSeen={lastSeen}
        currentUserId={currentUserId}
      />
    ),
    [getSender, isDarkMode, handleMentionClick, validContactNames, lastSeen, currentUserId]
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
        <MessageInput {...inputProps} />
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
      <MessageInput {...inputProps} />
      <ContactDetailModal {...modalProps} />
    </div>
  );
};
