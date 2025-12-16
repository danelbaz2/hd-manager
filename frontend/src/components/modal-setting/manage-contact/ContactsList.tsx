import React from "react";
import { User, Trash2, Pencil, Phone, Tag } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type ContactData,
  getTagById,
  getTextColor,
} from "../../../schemas/contactTypes";

interface ContactsListProps {
  contacts: ContactData[];
  editingContactId?: string | null;
  onEdit?: (contact: ContactData) => void;
  onDelete: (id: string) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  editingContactId,
  onEdit,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p
          className={`text-center ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          אין אנשי קשר להצגה
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={`
            flex items-center justify-between
            px-5 py-4 rounded-xl border
            transition-colors
            ${
              editingContactId === contact.id
                ? isDarkMode
                  ? "bg-blue-900/20 border-blue-500/50"
                  : "bg-blue-50 border-blue-200"
                : isDarkMode
                ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }
          `}
        >
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(contact.id)}
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
            {onEdit && (
              <button
                onClick={() => onEdit(contact)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    editingContactId === contact.id
                      ? "bg-blue-500 text-white"
                      : isDarkMode
                      ? "text-blue-400 hover:bg-blue-900/30"
                      : "text-blue-500 hover:bg-blue-50"
                  }
                `}
              >
                <Pencil size={18} />
              </button>
            )}
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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {contact.phone && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone size={12} />
                    {contact.phone}
                  </span>
                )}
              </div>
              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <Tag size={12} className="text-slate-400" />
                  {contact.tags.map((tagId) => {
                    const tag = getTagById(tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: tag.color,
                          color: getTextColor(tag.color),
                        }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
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
  );
};

export default ContactsList;
