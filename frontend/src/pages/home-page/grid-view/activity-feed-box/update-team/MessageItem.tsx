import React from "react";
import type { MessageItemProps } from "../../../../../schemas/teamMessageTypes";
import { MentionText } from "./mention";
import { useNewMessageHighlight } from "./hooks/useNewMessageHighlight";
import { formatTime, formatDate } from "./utils/messageFormatters";

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sender,
  isDarkMode,
  onMentionClick,
  validContactNames,
  isNew: propIsNew = false,
  lastSeen = 0,
  currentUserId,
}) => {
  const senderColor = sender?.color || "#6366f1";
  const senderName = sender?.fullName || message.base?.createdBy || "מנהל";
  const timestamp = message.base?.createdAt || Date.now();

  // Check if the current user is the sender - don't show NEW for own messages
  const isSender = currentUserId &&
    (message.senderId === currentUserId || message.base?.createdBy === currentUserId);

  const { isHighlighted, showBadge } = useNewMessageHighlight({
    timestamp,
    lastSeen,
    propIsNew,
    isSender: !!isSender,
  });

  return (
    <div
      className={`px-3 py-2 relative transition-all duration-[2000ms] ease-out ${isHighlighted
        ? isDarkMode
          ? "bg-blue-900/20 animate-slideInHighlight"
          : "bg-blue-50/70 animate-slideInHighlight"
        : ""
        }`}
      style={isHighlighted ? {
        borderRight: `4px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
        boxShadow: isDarkMode
          ? '0 0 15px rgba(96, 165, 250, 0.15)'
          : '0 0 15px rgba(59, 130, 246, 0.1)'
      } : {
        borderRight: '4px solid transparent',
        boxShadow: 'none'
      }}
      dir="rtl"
    >
      <div
        className={`rounded-2xl p-3 shadow-sm overflow-hidden ${isDarkMode
          ? "bg-slate-700/80 border border-slate-600"
          : "bg-white border border-slate-100"
          }`}
      >
        {/* Header: Avatar + Name + Time */}
        <div className="flex items-center mb-2">
          {showBadge && (
            <span
              className={`text-[10px] font-bold rounded overflow-hidden whitespace-nowrap transition-all duration-[2000ms] ease-out ${isHighlighted
                ? "opacity-100 animate-pulseFadeOut max-w-[50px] px-1.5 py-0.5 ml-2"
                : "opacity-0 max-w-0 px-0 py-0 ml-0 border-0"
                } ${isDarkMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"}`}
              style={isHighlighted ? {} : { transform: "scale(0.8)" }}
            >
              חדש
            </span>
          )}
          {sender?.profileImage ? (
            <img
              src={sender.profileImage}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover border-2"
              style={{ borderColor: senderColor }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: senderColor }}
            >
              {senderName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-slate-800"
                  }`}
              >
                {senderName}
              </span>
            </div>
            <span
              className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              {formatDate(timestamp)} • {formatTime(timestamp)}
            </span>
          </div>
        </div>

        {/* Message Content with Mentions */}
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDarkMode ? "text-slate-200" : "text-slate-700"
            }`}
        >
          <MentionText
            content={message.content}
            isDarkMode={isDarkMode}
            onMentionClick={onMentionClick}
            validContactNames={validContactNames}
          />
        </p>
      </div>
    </div>
  );
};
