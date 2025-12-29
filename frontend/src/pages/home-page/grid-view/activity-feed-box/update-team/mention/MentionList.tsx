// MentionList - Dropdown component for showing contact suggestions
import React from "react";
import { User, Loader2 } from "lucide-react";
import type { MentionListProps } from "./types";

export const MentionList: React.FC<MentionListProps> = ({
  contacts,
  searchQuery,
  isDarkMode,
  selectedIndex,
  onSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div
        className={`
          absolute bottom-full mb-2 right-0 w-72 rounded-xl border shadow-2xl
          backdrop-blur-sm overflow-hidden z-50
          ${
            isDarkMode
              ? "bg-slate-800/95 border-slate-600"
              : "bg-white/95 border-slate-200"
          }
        `}
        dir="rtl"
      >
        <div className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            טוען אנשי קשר...
          </span>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div
        className={`
          absolute bottom-full mb-2 right-0 w-72 rounded-xl border shadow-2xl
          backdrop-blur-sm overflow-hidden z-50
          ${
            isDarkMode
              ? "bg-slate-800/95 border-slate-600"
              : "bg-white/95 border-slate-200"
          }
        `}
        dir="rtl"
      >
        <div className="p-4 text-center">
          <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
            לא נמצאו אנשי קשר עבור "{searchQuery}"
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        absolute bottom-full mb-2 right-0 w-72 rounded-xl border shadow-2xl
        backdrop-blur-sm overflow-hidden z-50
        ${
          isDarkMode
            ? "bg-slate-800/95 border-slate-600"
            : "bg-white/95 border-slate-200"
        }
      `}
      dir="rtl"
    >
      {/* Header */}
      <div
        className={`
          px-4 py-2.5 border-b font-medium text-sm
          ${
            isDarkMode
              ? "border-slate-700 text-slate-300 bg-slate-700/50"
              : "border-slate-100 text-slate-600 bg-slate-50"
          }
        `}
      >
        📇 בחר איש קשר
      </div>

      {/* Contact List */}
      <div className="max-h-48 overflow-y-auto">
        {contacts.slice(0, 8).map((contact, index) => (
          <div
            key={contact.id}
            onClick={() => onSelect(contact)}
            className={`
              flex items-center gap-3 px-4 py-3 cursor-pointer
              transition-all duration-150
              ${
                index === selectedIndex
                  ? isDarkMode
                    ? "bg-blue-600/30 border-r-2 border-blue-500"
                    : "bg-blue-50 border-r-2 border-blue-500"
                  : isDarkMode
                  ? "hover:bg-slate-700/50"
                  : "hover:bg-slate-50"
              }
            `}
          >
            {/* Avatar */}
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-purple-500
                shadow-lg
              `}
            >
              <User className="w-5 h-5 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`
                  font-medium text-sm truncate
                  ${isDarkMode ? "text-white" : "text-slate-800"}
                `}
              >
                {contact.fullName}
              </p>
              {contact.position && (
                <p
                  className={`
                    text-xs truncate
                    ${isDarkMode ? "text-slate-400" : "text-slate-500"}
                  `}
                >
                  {contact.position}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
