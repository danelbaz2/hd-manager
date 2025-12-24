import React from "react";
import { User, Trash2, Pencil, Phone, Tag } from "lucide-react";
import {
  type ContactData,
  getTextColor,
} from "../../../../../schemas/contactTypes";
import { type PrimaryTagData } from "../../../../../schemas/tagTypes";
import { Tooltip } from "../../../../tags-tooltip";

interface ContactCardProps {
  contact: ContactData;
  tags: PrimaryTagData[];
  isEditing: boolean;
  isDarkMode: boolean;
  onEdit?: (contact: ContactData) => void;
  onCancelEdit?: () => void;
  onDeleteRequest: (contact: ContactData) => void;
}

/**
 * ContactCard - Individual contact display card with edit/delete actions
 */
const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  tags,
  isEditing,
  isDarkMode,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) => {
  const getTagById = (tagId: string): PrimaryTagData | undefined => {
    return tags.find((tag) => tag.id === tagId);
  };

  return (
    <div
      className={`
        flex items-center justify-between
        px-5 py-4 rounded-xl border
        transition-colors
        ${
          isEditing
            ? isDarkMode
              ? "bg-blue-900/20 border-blue-500/50"
              : "bg-blue-50 border-blue-200"
            : isDarkMode
            ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }
      `}
      onClick={() => console.log(contact)}
    >
      {/* Actions */}
      <div className="flex items-center gap-2">
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(contact);
          }}
          className={`
            p-2 rounded-lg transition-colors cursor-pointer
            ${
              isDarkMode
                ? "text-red-400 hover:bg-red-900/30"
                : "text-red-500 hover:bg-red-50"
            }
          `}
        >
          <Trash2 size={18} />
        </div>
        {onEdit && (
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              isEditing && onCancelEdit ? onCancelEdit() : onEdit(contact);
            }}
            className={`
              p-2 rounded-lg transition-colors cursor-pointer
              ${
                isEditing
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-blue-400 hover:bg-blue-900/30"
                  : "text-blue-500 hover:bg-blue-50"
              }
            `}
          >
            <Pencil size={18} />
          </div>
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
          {/* Primary Tags */}
          {contact.primaryTags && contact.primaryTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Tag size={12} className="text-slate-400" />
              {contact.primaryTags.map((tagId) => {
                const tag = getTagById(tagId);
                if (!tag) return null;
                return (
                  <Tooltip
                    key={tag.id}
                    content={tag.description}
                    position="top"
                  >
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium cursor-default"
                      style={{
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color),
                      }}
                    >
                      {tag.name}
                    </span>
                  </Tooltip>
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
  );
};

export default ContactCard;
