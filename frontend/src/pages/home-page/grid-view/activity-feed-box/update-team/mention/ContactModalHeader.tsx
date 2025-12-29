// ContactDetailModal - Header section with gradient and avatar
import React from "react";
import { User, X } from "lucide-react";

interface ModalHeaderProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export const ContactModalHeader: React.FC<ModalHeaderProps> = ({
  onClose,
  isDarkMode,
}) => (
  <div className="relative h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
    <button
      onClick={onClose}
      className="absolute top-3 left-3 p-1.5 rounded-full bg-white/20 
                 hover:bg-white/30 transition-colors backdrop-blur-sm"
    >
      <X className="w-5 h-5 text-white" />
    </button>

    {/* Avatar */}
    <div className="absolute -bottom-10 right-6">
      <div
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center
          bg-gradient-to-br from-blue-400 to-blue-600
          border-4 shadow-xl
          ${isDarkMode ? "border-slate-800" : "border-white"}
        `}
      >
        <User className="w-10 h-10 text-white" />
      </div>
    </div>
  </div>
);
