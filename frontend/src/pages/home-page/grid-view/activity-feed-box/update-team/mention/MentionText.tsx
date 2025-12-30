// MentionText - Renders message content with clickable mentions
import React, { useMemo } from "react";

interface MentionTextProps {
  content: string;
  isDarkMode: boolean;
  onMentionClick?: (contactName: string) => void;
  validContactNames?: string[];
}

// Regex to match @mentions (Hebrew and English names with spaces)
// Captures: @FirstName LastName until double space, punctuation, another @, or end
const MENTION_REGEX =
  /@([\u0590-\u05FFa-zA-Z]+(?:\s[\u0590-\u05FFa-zA-Z]+)*)(?=\s{2}|[.,!?\n@]|\s@|$)?/g;

export const MentionText: React.FC<MentionTextProps> = ({
  content,
  isDarkMode,
  onMentionClick,
  validContactNames,
}) => {
  const parts = useMemo(() => {
    const result: Array<{
      type: "text" | "mention";
      value: string;
      needsSpaceBefore?: boolean;
      needsSpaceAfter?: boolean;
    }> = [];
    let lastIndex = 0;

    // Reset regex
    MENTION_REGEX.lastIndex = 0;

    let match;
    while ((match = MENTION_REGEX.exec(content)) !== null) {
      const mentionStart = match.index;
      const mentionEnd = match.index + match[0].length;
      const name = match[1].trim();

      // Check validation if list provided
      const isValid = !validContactNames || validContactNames.includes(name);

      if (!isValid) {
        // Treat as plain text, skip regex capture group logic just continue
        continue;
      }

      // Check if text before mention needs space (doesn't end with space or start of string)
      const textBefore = content.slice(lastIndex, mentionStart);
      const needsSpaceBefore = textBefore.length > 0 && !/\s$/.test(textBefore);

      // Check if text after mention needs space (doesn't start with space, punctuation, or end)
      const charAfter = content[mentionEnd];
      const needsSpaceAfter = Boolean(charAfter && !/[\s.,!?@\n]/.test(charAfter));

      // Add text before mention
      if (mentionStart > lastIndex) {
        result.push({
          type: "text",
          value: textBefore,
        });
      }

      // Add mention with spacing flags
      result.push({
        type: "mention",
        value: name,
        needsSpaceBefore,
        needsSpaceAfter,
      });

      lastIndex = mentionEnd;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: "text",
        value: content.slice(lastIndex),
      });
    }

    return result;
  }, [content, validContactNames]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <React.Fragment key={index}>
              {part.needsSpaceBefore && " "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onMentionClick?.(part.value);
                }}
                className={`
                  inline-flex items-center px-2 py-0.5 rounded-lg
                  cursor-pointer transition-all duration-200
                  ${isDarkMode
                    ? "bg-blue-500/25 text-blue-300 hover:bg-blue-500/40"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }
                  ${onMentionClick ? "hover:scale-105 hover:shadow-md" : ""}
                `}
              >
                <span className="opacity-70">@</span>
                <span className="font-bold">{part.value}</span>
              </span>
              {part.needsSpaceAfter && " "}
            </React.Fragment>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
};
