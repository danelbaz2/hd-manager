// ContactDetailModal - Contact info display component
import React from "react";
import { Phone, Briefcase, Building2 } from "lucide-react";
import type { Contact } from "../../../../../../api/contactsApi";

interface ContactInfoProps {
  contact: Contact;
  isDarkMode: boolean;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  isDarkMode,
}) => (
  <div className="pt-14 pb-6 px-6">
    {/* Name & Position */}
    <div className="mb-6">
      <h3
        className={`text-xl font-bold mb-1 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        {contact.fullName}
      </h3>
      {contact.position && (
        <p
          className={`text-sm flex items-center gap-2 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          {contact.position}
        </p>
      )}
    </div>

    {/* Details */}
    <div className="space-y-3">
      {contact.phoneNumber && (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
          }`}
        >
          <div className="p-2 rounded-lg bg-green-500/20">
            <Phone className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              טלפון
            </p>
            <p
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {contact.phoneNumber}
            </p>
          </div>
        </div>
      )}

      {contact.department && (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
          }`}
        >
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Building2 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              מחלקה
            </p>
            <p
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {contact.department}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);
