import { useState, useEffect, useMemo } from "react";

interface UseNewMessageHighlightProps {
    timestamp: number;
    lastSeen: number;
    propIsNew?: boolean;
    isSender?: boolean;
}

interface UseNewMessageHighlightReturn {
    isHighlighted: boolean;
    showBadge: boolean;
}

/**
 * Custom hook to manage new message highlight animation and badge display
 * - Highlights message for 5 seconds
 * - Fades out badge over 2 additional seconds
 * - Skips animation if the current user is the sender
 */
export const useNewMessageHighlight = ({
    timestamp,
    lastSeen,
    propIsNew = false,
    isSender = false,
}: UseNewMessageHighlightProps): UseNewMessageHighlightReturn => {
    // If the current user sent this message, never show "new" badge
    const isInitiallyNew = useMemo(() => {
        if (isSender) return false; // Don't show NEW for own messages
        if (propIsNew) return true;
        if (lastSeen > 0 && timestamp > lastSeen) return true;
        return false;
    }, [propIsNew, lastSeen, timestamp, isSender]);

    const [isHighlighted, setHighlighted] = useState(isInitiallyNew);
    const [showBadge, setShowBadge] = useState(isInitiallyNew);

    // 5-second timer to remove highlight
    useEffect(() => {
        if (isInitiallyNew) {
            setHighlighted(true);
            setShowBadge(true);
            const timer = setTimeout(() => {
                setHighlighted(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isInitiallyNew]);

    // 2-second timer to remove badge after highlight removal
    useEffect(() => {
        if (!isHighlighted && showBadge) {
            const timer = setTimeout(() => {
                setShowBadge(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isHighlighted, showBadge]);

    return { isHighlighted, showBadge };
};
