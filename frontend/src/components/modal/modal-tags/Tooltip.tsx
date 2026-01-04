import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface TooltipProps {
  content: string | null | undefined;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

/**
 * Tooltip - Displays a small tooltip on hover
 * Only shows if content is provided and non-empty
 * Uses portal to render outside DOM hierarchy for proper z-index handling
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Don't render tooltip if no content
  const hasContent = content && content.trim().length > 0;

  const showTooltip = () => {
    if (!hasContent) return;

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();

        let x = rect.left + rect.width / 2;
        let y = rect.top;

        switch (position) {
          case "bottom":
            y = rect.bottom;
            break;
          case "left":
            x = rect.left;
            y = rect.top + rect.height / 2;
            break;
          case "right":
            x = rect.right;
            y = rect.top + rect.height / 2;
            break;
          default:
            y = rect.top;
        }

        setCoords({ x, y });
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position classes based on direction
  const getPositionStyles = () => {
    switch (position) {
      case "bottom":
        return {
          left: `${coords.x}px`,
          top: `${coords.y + 8}px`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          left: `${coords.x - 8}px`,
          top: `${coords.y}px`,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          left: `${coords.x + 8}px`,
          top: `${coords.y}px`,
          transform: "translateY(-50%)",
        };
      default: // top
        return {
          left: `${coords.x}px`,
          top: `${coords.y - 8}px`,
          transform: "translate(-50%, -100%)",
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible &&
        hasContent &&
        ReactDOM.createPortal(
          <div
            className="fixed px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
            style={{ ...getPositionStyles(), zIndex: 999999 }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-slate-800 transform rotate-45
              ${
                position === "top"
                  ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                  : ""
              }
              ${
                position === "bottom"
                  ? "top-[-4px] left-1/2 -translate-x-1/2"
                  : ""
              }
              ${
                position === "left"
                  ? "right-[-4px] top-1/2 -translate-y-1/2"
                  : ""
              }
              ${
                position === "right"
                  ? "left-[-4px] top-1/2 -translate-y-1/2"
                  : ""
              }
            `}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
