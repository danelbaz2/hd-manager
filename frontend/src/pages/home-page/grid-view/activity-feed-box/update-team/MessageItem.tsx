import React from "react";
import type { MessageItemProps } from "./types";

// Format time as HH:MM
const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

// Format date for message header
const formatDate = (ts: number): string => {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "היום";
  if (date.toDateString() === yesterday.toDateString()) return "אתמול";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sender,
  isDarkMode,
}) => {
  const senderColor = sender?.color || "#6366f1";
  const senderName = sender?.fullName || message.base?.createdBy || "מנהל";
  const timestamp = message.base?.createdAt || Date.now();

  return (
    <div className="px-3 py-2" dir="rtl">
      <div
        className={`rounded-2xl p-3 shadow-sm ${
          isDarkMode
            ? "bg-slate-700/80 border border-slate-600"
            : "bg-white border border-slate-100"
        }`}
      >
        {/* Header: Avatar + Name + Time */}
        <div className="flex items-center gap-2 mb-2">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                {senderName}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${senderColor}20`,
                  color: senderColor,
                }}
              >
                מנהל
              </span>
            </div>
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {formatDate(timestamp)} • {formatTime(timestamp)}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
};
