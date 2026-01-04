import React from "react";
import { Phone, Briefcase } from "lucide-react";
import type { ContactData } from "../../../schemas/contactTypes";

interface ContactCardProps {
  contact: ContactData;
  isDarkMode: boolean;
}

/**
 * ContactCard - Compact contact display for the tags modal
 */
const ContactCard: React.FC<ContactCardProps> = ({ contact, isDarkMode }) => {
  return (
    <div
      className={`
                p-3 rounded-xl transition-all
                ${
                  isDarkMode
                    ? "bg-slate-700/50 hover:bg-slate-700"
                    : "bg-slate-50 hover:bg-slate-100"
                }
            `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        text-white font-bold text-sm flex-shrink-0
                        ${
                          isDarkMode
                            ? "bg-gradient-to-br from-blue-500 to-purple-600"
                            : "bg-gradient-to-br from-blue-400 to-purple-500"
                        }
                    `}
        >
          {contact.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-sm truncate ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {contact.name}
          </h4>

          {/* Role */}
          {contact.role && (
            <div className="flex items-center gap-1.5 mt-1">
              <Briefcase
                className={`w-3 h-3 flex-shrink-0 ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <span
                className={`text-xs truncate ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {contact.role}
              </span>
            </div>
          )}

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-center gap-1.5 mt-1">
              <Phone
                className={`w-3 h-3 flex-shrink-0 ${
                  isDarkMode ? "text-green-400" : "text-green-500"
                }`}
              />
              <a
                href={`tel:${contact.phone}`}
                className={`text-xs hover:underline ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
                dir="ltr"
              >
                {contact.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
