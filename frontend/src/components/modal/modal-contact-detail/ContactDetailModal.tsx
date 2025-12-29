// ContactDetailModal - Modal for displaying contact details with clean animation
import React, { useEffect, useState } from "react";
import type { ContactDetailModalProps } from "../../../schemas/mentionTypes";
import { ContactModalContent } from "./ContactModalContent";
import { X, User } from "lucide-react";

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isAnimating && !isOpen) return null;
  if (!contact) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200
        ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 transition-all duration-200
          ${isVisible ? "bg-black/60 backdrop-blur-md" : "bg-transparent"}`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative z-10 w-full max-w-md mx-4 rounded-3xl border shadow-2xl
          overflow-hidden transition-all duration-200 ease-out
          ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-600"
              : "bg-white border-slate-200"
          }
        `}
        dir="rtl"
      >
        {/* Header with Avatar */}
        <div className="relative pt-6 pb-4 px-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`
              absolute top-4 left-4 p-2 rounded-xl transition-all
              ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg transition-transform duration-300
                          ${isVisible ? "scale-100" : "scale-90"}`}
            >
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <ContactModalContent contact={contact} isDarkMode={isDarkMode} />

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDarkMode ? "border-slate-700" : "border-slate-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`
              w-full py-3 rounded-xl font-semibold transition-all
              ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }
            `}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailModal;
