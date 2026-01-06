import React, { useState, useMemo } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { usePrimaryTagsQuery } from "../../../../api/queries";
import { mapPrimaryTagsToData } from "../../../../api/typeMappers";
import {
  type ContactFormData,
  DEFAULT_CONTACT_FORM,
} from "../../../../schemas/contactTypes";
import {
  createContact,
  type ContactFormPayload,
} from "../../../../api/contactsApi";
import { ToastContainer, useToast } from "../../../alert-feedback";
import { TagSelector } from "./components";

interface AddContactFormProps {
  onAdd: () => void;
}

/**
 * AddContactForm - Form for creating new contacts
 * Refactored to use TagSelector shared component
 */
const AddContactForm: React.FC<AddContactFormProps> = ({ onAdd }) => {
  const { isDarkMode } = useTheme();
  const { data: primaryTagsData = [], isLoading: isLoadingTags } = usePrimaryTagsQuery();
  const primaryTags = useMemo(() => mapPrimaryTagsToData(primaryTagsData), [primaryTagsData]);
  const [formData, setFormData] =
    useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

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
        primaryTagIds:
          formData.primaryTags.length > 0 ? formData.primaryTags : undefined,
      };

      const response = await createContact(payload);

      if (response.success) {
        showSuccess("הצלחה", "איש הקשר נוסף בהצלחה");
        setFormData(DEFAULT_CONTACT_FORM);
        setTimeout(() => onAdd(), 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה ביצירת איש הקשר");
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
    px-4 py-2.5 rounded-lg border text-right transition-colors
    ${isDarkMode
      ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  `;

  return (
    <>
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div
        className={`rounded-xl border p-6 mb-6 ${isDarkMode
            ? "bg-slate-700/50 border-slate-600"
            : "bg-slate-50 border-slate-200"
          }`}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          <span
            className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"
              }`}
          >
            הוספת איש קשר
          </span>
          <UserPlus size={18} className="text-slate-400" />
        </div>

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
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            disabled={isSaving}
            className={`flex-1 min-w-[120px] ${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          {/* Tag Selector */}
          <TagSelector
            selectedTagIds={formData.primaryTags}
            availableTags={primaryTags}
            isDarkMode={isDarkMode}
            isLoading={isLoadingTags}
            isDisabled={isSaving}
            onToggleTag={toggleTag}
            onRemoveTag={removeTag}
          />

          {/* Add Button */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg
              bg-blue-500 hover:bg-blue-600 text-white font-medium
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
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
