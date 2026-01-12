/**
 * MentionText - Renders message content with clickable mentions.
 * Uses parseMentions utility for parsing.
 */
import React, { useMemo } from "react";
import { parseMentions } from "./mentionUtils";

// Re-export utilities for backward compatibility
export { parseMentions, normalizeMentionSpacing } from "./mentionUtils";

interface MentionTextProps {
  content: string;
  isDarkMode: boolean;
  onMentionClick?: (contactName: string) => void;
  validContactNames?: string[];
}

export const MentionText: React.FC<MentionTextProps> = ({
  content,
  isDarkMode,
  onMentionClick,
  validContactNames,
}) => {
  const parts = useMemo(
    () => parseMentions(content, validContactNames),
    [content, validContactNames]
  );

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onMentionClick?.(part.value);
              }}
              className={`
                inline-flex items-center px-2 py-0.5 rounded-lg
                cursor-pointer transition-all duration-200
                ${isDarkMode
                  ? "bg-blue-500/25 text-blue-300 hover:bg-blue-500/40 hover:shadow-lg hover:brightness-110"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-lg hover:brightness-105"
                }
              `}
            >
              <span className="opacity-70">@</span>
              <span className="font-bold">{part.value}</span>
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
};
