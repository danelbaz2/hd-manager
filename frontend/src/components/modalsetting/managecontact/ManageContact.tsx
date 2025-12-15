import React, { useState } from "react";
import { User, Trash2, Pencil, UserPlus, Phone, Mail } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface ContactData {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

const ManageContact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [contacts, setContacts] = useState<ContactData[]>([
    {
      id: "1",
      name: "תמיכה טכנית",
      role: "חיצוני",
      phone: "050-0000000",
      email: "support@example.com",
    },
    {
      id: "2",
      name: "ספק שרתים",
      role: "תשתיות",
      phone: "052-1111111",
      email: "cloud@example.com",
    },
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
  });

  const handleAddContact = () => {
    if (!newContact.name) return;

    const contact: ContactData = {
      id: Date.now().toString(),
      name: newContact.name,
      role: newContact.role,
      phone: newContact.phone,
      email: newContact.email,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: "", role: "", phone: "", email: "" });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        אנשי קשר מערכתיים
      </h1>

      {/* Add New Contact Form */}
      <div
        className={`
          rounded-xl border p-6 mb-6
          ${
            isDarkMode
              ? "bg-slate-700/50 border-slate-600"
              : "bg-slate-50 border-slate-200"
          }
        `}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          <span
            className={`font-medium ${
              isDarkMode ? "text-slate-200" : "text-slate-700"
            }`}
          >
            הוספת איש קשר
          </span>
          <UserPlus size={18} className="text-slate-400" />
        </div>

        <div className="space-y-4" dir="rtl">
          {/* Row 1: Name and Role */}
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="שם מלא"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              className={`
                flex-1 min-w-[200px] px-4 py-2.5
                rounded-lg border text-right
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            />
            <input
              type="text"
              placeholder="תפקיד/תיאור"
              value={newContact.role}
              onChange={(e) =>
                setNewContact({ ...newContact, role: e.target.value })
              }
              className={`
                flex-1 min-w-[150px] px-4 py-2.5
                rounded-lg border text-right
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            />
          </div>

          {/* Row 2: Phone and Email */}
          <div className="flex flex-wrap gap-4">
            <input
              type="tel"
              placeholder="טלפון"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
              className={`
                flex-1 min-w-[200px] px-4 py-2.5
                rounded-lg border text-right
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            />
            <input
              type="email"
              placeholder="אימייל"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className={`
                flex-1 min-w-[150px] px-4 py-2.5
                rounded-lg border text-right
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddContact}
            className="
              flex items-center gap-2
              px-6 py-2.5 rounded-lg
              bg-blue-500 hover:bg-blue-600
              text-white font-medium
              transition-colors
            "
          >
            הוסף איש קשר
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`
              flex items-center justify-between
              px-5 py-4 rounded-xl border
              transition-colors
              ${
                isDarkMode
                  ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    isDarkMode
                      ? "text-red-400 hover:bg-red-900/30"
                      : "text-red-500 hover:bg-red-50"
                  }
                `}
              >
                <Trash2 size={18} />
              </button>
              <button
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    isDarkMode
                      ? "text-blue-400 hover:bg-blue-900/30"
                      : "text-blue-500 hover:bg-blue-50"
                  }
                `}
              >
                <Pencil size={18} />
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {contact.name}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {contact.role}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  {contact.email && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Mail size={12} />
                      {contact.email}
                    </span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone size={12} />
                      {contact.phone}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isDarkMode ? "bg-slate-600" : "bg-slate-100"}
                `}
              >
                <User size={20} className="text-blue-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageContact;
