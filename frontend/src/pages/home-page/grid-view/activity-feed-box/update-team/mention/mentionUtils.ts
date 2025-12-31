/**
 * mentionUtils - Utility functions for mention parsing and normalization.
 * These are shared between UpdateTeam and History tab.
 */

export interface ParsedPart {
    type: "text" | "mention";
    value: string;
}

/**
 * Parses text content and extracts mentions by matching EXACTLY against valid contact names.
 * Handles all RTL/LTR combinations (Hebrew/English names and text).
 * 
 * @param content - The text content to parse
 * @param validContactNames - List of valid contact names to match against
 */
export const parseMentions = (
    content: string,
    validContactNames?: string[]
): ParsedPart[] => {
    const result: ParsedPart[] = [];

    if (!validContactNames || validContactNames.length === 0) {
        if (content) result.push({ type: "text", value: content });
        return result;
    }

    // Sort names by length descending to match longest names first
    const sortedNames = [...validContactNames].sort((a, b) => b.length - a.length);
    let currentIndex = 0;

    while (currentIndex < content.length) {
        const atIndex = content.indexOf("@", currentIndex);

        if (atIndex === -1) {
            if (currentIndex < content.length) {
                result.push({ type: "text", value: content.slice(currentIndex) });
            }
            break;
        }

        if (atIndex > currentIndex) {
            result.push({ type: "text", value: content.slice(currentIndex, atIndex) });
        }

        const textAfterAt = content.slice(atIndex + 1);
        let matchedName: string | null = null;

        for (const name of sortedNames) {
            if (textAfterAt.startsWith(name)) {
                matchedName = name;
                break;
            }
        }

        if (matchedName) {
            result.push({ type: "mention", value: matchedName });
            currentIndex = atIndex + 1 + matchedName.length;
        } else {
            result.push({ type: "text", value: "@" });
            currentIndex = atIndex + 1;
        }
    }

    return result;
};

/**
 * Normalizes message content to ensure proper spacing around mentions.
 * Adds space before/after mentions when text is directly attached.
 * 
 * @param content - The text content to normalize
 * @param validContactNames - List of valid contact names to match against
 */
export const normalizeMentionSpacing = (
    content: string,
    validContactNames?: string[]
): string => {
    if (!validContactNames || validContactNames.length === 0) return content;

    const sortedNames = [...validContactNames].sort((a, b) => b.length - a.length);
    let result = "";
    let currentIndex = 0;

    while (currentIndex < content.length) {
        const atIndex = content.indexOf("@", currentIndex);

        if (atIndex === -1) {
            result += content.slice(currentIndex);
            break;
        }

        result += content.slice(currentIndex, atIndex);

        const textAfterAt = content.slice(atIndex + 1);
        let matchedName: string | null = null;

        for (const name of sortedNames) {
            if (textAfterAt.startsWith(name)) {
                matchedName = name;
                break;
            }
        }

        if (matchedName) {
            // Add space before @ if needed
            const charBefore = result.length > 0 ? result[result.length - 1] : null;
            if (charBefore && !/[\s.,!?\n@]/.test(charBefore)) {
                result += " ";
            }

            result += "@" + matchedName;
            currentIndex = atIndex + 1 + matchedName.length;

            // Add space after if needed
            const charAfter = content[currentIndex];
            if (charAfter && !/[\s.,!?\n@]/.test(charAfter)) {
                result += " ";
            }
        } else {
            result += "@";
            currentIndex = atIndex + 1;
        }
    }

    return result;
};
