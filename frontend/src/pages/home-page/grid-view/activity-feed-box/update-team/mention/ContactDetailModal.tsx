// ContactDetailModal - Modal for displaying contact details
import React from "react";
import type { ContactDetailModalProps } from "./types";
import { ContactModalHeader } from "./ContactModalHeader";
import { ContactInfo } from "./ContactInfo";

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  isDarkMode,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10 w-full max-w-sm mx-4 rounded-2xl border shadow-2xl
          overflow-hidden
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-600"
              : "bg-white border-slate-200"
          }
        `}
        dir="rtl"
      >
        <ContactModalHeader onClose={onClose} isDarkMode={isDarkMode} />
        <ContactInfo contact={contact} isDarkMode={isDarkMode} />

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            isDarkMode ? "border-slate-700" : "border-slate-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`
              w-full py-2.5 rounded-xl font-medium transition-all
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
