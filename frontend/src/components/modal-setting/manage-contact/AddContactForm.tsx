import React, { useState } from "react";
import { UserPlus, ChevronDown, X, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSettings } from "../../../contexts/SettingsContext";
import {
  type ContactFormData,
  getTextColor,
  DEFAULT_CONTACT_FORM,
} from "../../../schemas/contactTypes";
import { type PrimaryTagData } from "../../../schemas/tagTypes";
import {
  createContact,
  type ContactFormPayload,
} from "../../../api/contactsApi";
import { ToastContainer, useToast } from "../../alert-feedback";

interface AddContactFormProps {
  onAdd: () => void;
}

const AddContactForm: React.FC<AddContactFormProps> = ({ onAdd }) => {
  const { isDarkMode } = useTheme();
  const { primaryTags, isLoadingTags } = useSettings(); // Use primary tags for contacts
  const [formData, setFormData] = useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } = useToast();

  // Helper to get primary tag by ID
  const getTagById = (tagId: string): PrimaryTagData | undefined => {
    return primaryTags.find((tag) => tag.id === tagId);
  };

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.length < 2) {
      showWarning("שגיאת אימות", "שם מלא חייב להכיל לפחות 2 תווים");
      return false;
    }
    if (!formData.phone || formData.phone.length < 1) {
      showWarning("שגיאת אימות", "מספר טלפון הוא שדה חובה");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const payload: ContactFormPayload = {
        fullName: formData.name,
        phoneNumber: formData.phone,
        position: formData.role || undefined,
        primaryTagIds: formData.primaryTags.length > 0 ? formData.primaryTags : undefined,
      };

      const response = await createContact(payload);

      if (response.success) {
        showSuccess("הצלחה", "איש הקשר נוסף בהצלחה");
        setFormData(DEFAULT_CONTACT_FORM);
        setIsTagDropdownOpen(false);
        setTimeout(() => {
          onAdd();
        }, 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה ביצירת איש הקשר");
        console.error("Failed to create contact:", response.error);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (formData.primaryTags.includes(tagId)) {
      setFormData({
        ...formData,
        primaryTags: formData.primaryTags.filter((id) => id !== tagId),
      });
    } else {
      setFormData({
        ...formData,
        primaryTags: [...formData.primaryTags, tagId],
      });
    }
  };

  const removeTag = (tagId: string) => {
    setFormData({
      ...formData,
      primaryTags: formData.primaryTags.filter((id) => id !== tagId),
    });
  };

  const inputStyles = `
    px-4 py-2.5
    rounded-lg border text-right
    transition-colors
    ${isDarkMode
      ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  `;

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div
        className={`
          rounded-xl border p-6 mb-6
          ${isDarkMode
            ? "bg-slate-700/50 border-slate-600"
            : "bg-slate-50 border-slate-200"
          }
        `}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          <span
            className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
          >
            הוספת איש קשר
          </span>
          <UserPlus size={18} className="text-slate-400" />
        </div>

        {/* Form Layout */}
        <div className="flex flex-wrap items-center gap-4" dir="rtl">
          {/* Name Input */}
          <input
            type="text"
            placeholder="שם מלא *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isSaving}
            className={`flex-1 min-w-[150px] ${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {/* Role Input */}
          <input
            type="text"
            placeholder="תפקיד/תיאור"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={isSaving}
            className={`flex-1 min-w-[120px] ${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {/* Phone Input */}
          <input
            type="tel"
            placeholder="טלפון *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isSaving}
            className={`flex-1 min-w-[120px] ${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {/* Tags Dropdown */}
          <div className="relative flex-1 min-w-[200px]">
            <div
              role="button"
              onClick={() => !isSaving && !isLoadingTags && setIsTagDropdownOpen(!isTagDropdownOpen)}
              className={`
                w-full px-3 py-2 cursor-pointer
                rounded-lg border text-right
                flex items-start justify-between gap-2
                transition-colors min-h-[42px]
                ${isDarkMode
                  ? "bg-slate-800 border-slate-600 text-white"
                  : "bg-white border-slate-200 text-slate-800"
                }
                ${isSaving || isLoadingTags ? "opacity-50 cursor-not-allowed" : ""}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            >
              {isLoadingTags ? (
                <Loader2 size={16} className="animate-spin mt-1" />
              ) : (
                <ChevronDown
                  size={18}
                  className={`transition-transform flex-shrink-0 mt-1 ${isTagDropdownOpen ? "rotate-180" : ""
                    } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                />
              )}
              <div className={`flex-1 flex flex-wrap gap-1.5 justify-end max-h-[80px] overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}>
                {formData.primaryTags.length === 0 ? (
                  <span className={`py-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>
                    {isLoadingTags ? "טוען תגיות..." : primaryTags.length === 0 ? "אין תגיות" : "בחר קטגוריות"}
                  </span>
                ) : (
                  formData.primaryTags.map((tagId: string) => {
                    const tag = getTagById(tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap"
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
                          className="hover:opacity-70 flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>


            {/* Dropdown Menu */}
            {isTagDropdownOpen && primaryTags.length > 0 && (
              <div
                className={`
                  absolute top-full left-0 right-0 mt-1 z-10
                  rounded-lg border shadow-lg
                  max-h-48 overflow-y-auto
                  ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
                  ${isDarkMode
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-slate-200"
                  }
                `}
              >
                {primaryTags.map((tag: PrimaryTagData) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      w-full px-4 py-2 text-right
                      flex items-center justify-between
                      transition-colors
                      ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}
                      ${formData.primaryTags.includes(tag.id)
                        ? isDarkMode
                          ? "bg-slate-700"
                          : "bg-slate-100"
                        : ""
                      }
                    `}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center
                        ${formData.primaryTags.includes(tag.id)
                          ? "bg-blue-500 border-blue-500"
                          : isDarkMode
                            ? "border-slate-500"
                            : "border-slate-300"
                        }
                      `}
                    >
                      {formData.primaryTags.includes(tag.id) && (
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

          {/* Add Button */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`
              flex items-center gap-2
              px-6 py-2.5 rounded-lg
              bg-blue-500 hover:bg-blue-600
              text-white font-medium
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}
            <span>{isSaving ? "מוסיף..." : "הוסף"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AddContactForm;
