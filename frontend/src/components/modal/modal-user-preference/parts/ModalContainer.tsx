import React from "react";
import { X, User } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { hexWithAlpha, darkenColor } from "../../../../utils/colorUtils";

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color?: string; // Optional color for the card background
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  color,
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  // Calculate card colors based on selected color
  const bgOpacity = isDarkMode ? 0.08 : 0.04;

  const hasColor = color && color !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative flex flex-col
          w-[95%] max-w-xl h-auto max-h-[85vh]
          rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300
          ${isDarkMode ? "bg-slate-800" : "bg-white"}
        `}
      >
        {/* Color Banner at top (only if color provided) */}
        {hasColor && (
          <div
            className="w-full h-1.5"
            style={{ backgroundColor: darkenColor(color, 10) }}
          />
        )}

        {/* Header */}
        <div
          className={`
            flex items-center justify-between
            px-6 py-4 border-b
            ${isDarkMode ? "border-slate-700" : "border-slate-200"}
          `}
        >
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }
            `}
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2">
            <h2
              className={`text-lg font-bold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {title}
            </h2>
            <User size={20} className="text-blue-500" />
          </div>
        </div>

        {/* Content - with color background if provided */}
        <div
          className="flex-1 overflow-y-auto"
          style={
            hasColor
              ? {
                  backgroundColor: hexWithAlpha(color, bgOpacity),
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;
