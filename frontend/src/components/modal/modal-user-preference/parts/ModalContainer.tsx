import React from "react";
import { X, User } from "lucide-react";
import { useTheme } from "../../../../contexts";

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Same size as ManageSetting */}
      <div
        className={`
          relative flex flex-col
          w-[95%] max-w-2xl h-auto max-h-[85vh]
          rounded-2xl shadow-2xl overflow-hidden
          ${isDarkMode ? "bg-slate-800" : "bg-white"}
        `}
      >
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalContainer;
