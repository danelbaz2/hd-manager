// MentionText - Renders message content with clickable mentions
import React, { useMemo } from "react";

interface MentionTextProps {
  content: string;
  isDarkMode: boolean;
  onMentionClick?: (contactName: string) => void;
}

// Regex to match @mentions (words after @)
const MENTION_REGEX = /@([\u0590-\u05FFa-zA-Z\s]+?)(?=\s|$|[.,!?])/g;

export const MentionText: React.FC<MentionTextProps> = ({
  content,
  isDarkMode,
  onMentionClick,
}) => {
  const parts = useMemo(() => {
    const result: Array<{ type: "text" | "mention"; value: string }> = [];
    let lastIndex = 0;

    // Reset regex
    MENTION_REGEX.lastIndex = 0;

    let match;
    while ((match = MENTION_REGEX.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          value: content.slice(lastIndex, match.index),
        });
      }

      // Add mention
      result.push({
        type: "mention",
        value: match[1].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: "text",
        value: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span
              key={index}
              onClick={() => onMentionClick?.(part.value)}
              className={`
                inline-flex items-center px-1.5 py-0.5 rounded-md mx-0.5
                font-medium cursor-pointer transition-all duration-200
                ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }
                ${onMentionClick ? "hover:scale-105" : ""}
              `}
            >
              @{part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
};
