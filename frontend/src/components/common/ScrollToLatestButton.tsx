import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScrollToLatestButtonProps {
    containerRef: React.RefObject<HTMLElement | null> | React.MutableRefObject<HTMLElement | null>;
    direction: "up" | "down";
    threshold?: number;
    className?: string; // Allow custom positioning if needed
}

export const ScrollToLatestButton: React.FC<ScrollToLatestButtonProps> = ({
    containerRef,
    direction,
    threshold = 100,
    className,
}) => {
    const { isDarkMode } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            // Don't show button if we are currently auto-scrolling
            if (isScrolling) return;

            let shouldShow = false;

            // Calculate if we have scrolled away from the "latest" content
            if (direction === "up") {
                // Latest is at TOP (scrollTop 0). Show if we scrolled DOWN away from it.
                shouldShow = container.scrollTop > threshold;
            } else {
                // Latest is at BOTTOM. Show if we scrolled UP away from it.
                const distanceFromBottom =
                    container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight;
                shouldShow = distanceFromBottom > threshold;
            }

            // Show immediately on scroll
            if (shouldShow) {
                setIsVisible(true);

                // Reset auto-hide timer
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setIsVisible(false);
                }, 3000);
            } else {
                setIsVisible(false);
                clearTimeout(timeoutId);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            clearTimeout(timeoutId);
        };
    }, [containerRef, direction, threshold, isScrolling]);

    const handleClick = () => {
        if (isScrolling) return;

        const container = containerRef.current;
        if (!container) return;

        setIsScrolling(true);
        // Ensure button hides immediately after clicking triggers fade out
        setIsVisible(false);

        const targetTop = direction === "up" ? 0 : container.scrollHeight - container.clientHeight;
        const startTop = container.scrollTop;
        const distance = targetTop - startTop;
        // Adaptive duration: Faster response (1000ms - 2000ms)
        const duration = Math.min(2000, Math.max(1000, Math.abs(distance) * 0.25));
        let startTime: number | null = null;

        // Easing function: easeInOutQuad
        // Starts faster (less lag feeling) than Cubic/Quart, but still smooth acceleration
        const easeInOutQuad = (x: number): number => {
            return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        };

        const animateScroll = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutQuad(progress);

            container.scrollTop = startTop + distance * ease;

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                setIsScrolling(false);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isScrolling}
            className={`absolute left-1/2 -translate-x-1/2 z-50 p-3 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group ${isDarkMode
                ? "bg-slate-900/60 border-slate-700/50 text-blue-400 hover:bg-slate-900 hover:border-blue-500/50 hover:shadow-blue-500/40"
                : "bg-white/60 border-slate-200/50 text-blue-600 hover:bg-white hover:border-blue-400/50 hover:shadow-blue-400/30"
                } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"} ${className || ""}`}
            style={{
                // Default positioning if no className override
                bottom: !className && direction === "down" ? "20px" : undefined,
                top: !className && direction === "up" ? "20px" : undefined,
            }}
        >
            {direction === "up" ? (
                <ChevronUp className="w-5 h-5" />
            ) : (
                <ChevronDown className="w-5 h-5" />
            )}
        </button>
    );
};
