/**
 * PageHelpButton - Floating help button for each page
 *
 * Fixed position at bottom-left corner
 * Clicking triggers the tour for the current page
 */
import React from "react";
import { HelpCircle } from "lucide-react";
import { useTheme } from "../../../contexts";
import { useTour } from "../tour-provider";
import type { TourPageId } from "../shared/types";

interface PageHelpButtonProps {
  pageId: TourPageId;
  onClick?: () => void;
  showPulse?: boolean;
  title?: string;
}

const PageHelpButton: React.FC<PageHelpButtonProps> = ({
  pageId,
  onClick,
  showPulse: customShowPulse,
  title,
}) => {
  const { isDarkMode } = useTheme();
  const { startTour, hasSeenTour } = useTour();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      startTour(pageId);
    }
  };

  // Show a subtle pulse animation if user hasn't seen the tour yet
  // Use custom prop if provided, otherwise check tour state
  const shouldShowPulse =
    customShowPulse !== undefined ? customShowPulse : !hasSeenTour(pageId);

  return (
    <button
      onClick={handleClick}
      className={`
                fixed bottom-4 left-4 z-[9999]
                w-10 h-10 rounded-full
                flex items-center justify-center
                shadow-lg hover:shadow-xl
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
                group
                ${isDarkMode
          ? "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          : "bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400"
        }
                ${shouldShowPulse ? "animate-pulse" : ""}
            `}
      title={title}
      aria-label={title}
    >
      <HelpCircle className="w-6 h-6 text-white drop-shadow-sm" />

      {/* Tooltip - appears on the right side */}
      <span
        className={`
                absolute left-full ml-3 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-200
                ${isDarkMode
            ? "bg-slate-800 text-white shadow-lg"
            : "bg-white text-slate-700 shadow-lg border border-slate-200"
          }
            `}
      >
        {title}
      </span>
    </button>
  );
};

export default PageHelpButton;
