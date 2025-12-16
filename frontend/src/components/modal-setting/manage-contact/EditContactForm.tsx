import React, { useState } from "react";
import { Save, ChevronDown, X } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type ContactFormData,
  AVAILABLE_TAGS,
  getTagById,
  getTextColor,
} from "../../../schemas/contactTypes";

interface EditContactFormProps {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  onSave: () => void;
  onCancel: () => void;
}

const EditContactForm: React.FC<EditContactFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const handleSaveClick = () => {
    if (!formData.name) return;
    console.log("Updating Contact - Form Data:", formData);
    onSave();
  };

  const toggleTag = (tagId: string) => {
    if (formData.tags.includes(tagId)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter((id) => id !== tagId),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagId],
      });
    }
  };

  const removeTag = (tagId: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((id) => id !== tagId),
    });
  };

  const inputStyles = `
    px-4 py-2.5
    rounded-lg border text-right
    transition-colors
    ${
      isDarkMode
        ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
        : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  `;

  return (
    <div
      className={`
        rounded-xl border p-6 mb-6
        ${
          isDarkMode
            ? "bg-blue-900/20 border-blue-500/50"
            : "bg-blue-50 border-blue-200"
        }
      `}
    >
      <div className="flex items-center justify-end gap-2 mb-4">
        <span
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          עריכת איש קשר
        </span>
      </div>

      <div className="space-y-4" dir="rtl">
        {/* Row 1: Name and Role */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="שם מלא"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputStyles}
          />
          <input
            type="text"
            placeholder="תפקיד/תיאור"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={inputStyles}
          />
        </div>

        {/* Row 2: Phone and Tags */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="tel"
            placeholder="טלפון"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className={inputStyles}
          />

          {/* Tags Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              className={`
                w-full px-4 py-2.5
                rounded-lg border text-right
                flex items-center justify-between
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-white border-slate-200 text-slate-800"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  isTagDropdownOpen ? "rotate-180" : ""
                } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              />
              <div className="flex items-center gap-2 flex-wrap">
                {formData.tags.length === 0 ? (
                  <span
                    className={isDarkMode ? "text-slate-400" : "text-slate-400"}
                  >
                    בחר תגיות
                  </span>
                ) : (
                  formData.tags.map((tagId) => {
                    const tag = getTagById(tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: tag.color,
                          color: getTextColor(tag.color),
                        }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                          className="hover:opacity-70"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isTagDropdownOpen && (
              <div
                className={`
                  absolute top-full left-0 right-0 mt-1 z-10
                  rounded-lg border shadow-lg
                  max-h-48 overflow-y-auto
                  ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-600"
                      : "bg-white border-slate-200"
                  }
                `}
              >
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      w-full px-4 py-2 text-right
                      flex items-center justify-between
                      transition-colors
                      ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}
                      ${
                        formData.tags.includes(tag.id)
                          ? isDarkMode
                            ? "bg-slate-700"
                            : "bg-slate-100"
                          : ""
                      }
                    `}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center
                        ${
                          formData.tags.includes(tag.id)
                            ? "bg-blue-500 border-blue-500"
                            : isDarkMode
                            ? "border-slate-500"
                            : "border-slate-300"
                        }
                      `}
                    >
                      {formData.tags.includes(tag.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color),
                      }}
                    >
                      {tag.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveClick}
            className="
              flex items-center gap-2
              px-6 py-2.5 rounded-lg
              bg-blue-500 hover:bg-blue-600
              text-white font-medium
              transition-colors
            "
          >
            <Save size={18} />
            <span>שמור</span>
          </button>
          <button
            onClick={onCancel}
            className={`
              px-4 py-2.5 rounded-lg
              font-medium transition-colors
              ${
                isDarkMode
                  ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }
            `}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContactForm;
