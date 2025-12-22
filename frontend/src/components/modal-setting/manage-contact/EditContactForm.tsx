import React, { useState } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSettings } from "../../../contexts/SettingsContext";
import { type ContactFormData } from "../../../schemas/contactTypes";
import {
  updateContact,
  type ContactFormPayload,
} from "../../../api/contactsApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import { TagSelector } from "./components";

interface EditContactFormProps {
  formData: ContactFormData;
  originalData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * EditContactForm - Form for editing existing contacts
 * Refactored to use TagSelector shared component
 */
const EditContactForm: React.FC<EditContactFormProps> = ({
  formData,
  originalData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const { primaryTags, isLoadingTags } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const validateForm = (): boolean => {
    if (!formData.id) {
      showWarning("שגיאה", "מזהה איש קשר חסר");
      return false;
    }
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

  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  const buildChangedPayload = (): Partial<ContactFormPayload> => {
    const payload: Partial<ContactFormPayload> = {};
    if (formData.name !== originalData.name) payload.fullName = formData.name;
    if (formData.role !== originalData.role)
      payload.position = formData.role || undefined;
    if (formData.phone !== originalData.phone)
      payload.phoneNumber = formData.phone || undefined;
    if (!arraysEqual(formData.primaryTags, originalData.primaryTags)) {
      payload.primaryTagIds =
        formData.primaryTags.length > 0 ? formData.primaryTags : undefined;
    }
    return payload;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const updatePayload = buildChangedPayload();

      if (Object.keys(updatePayload).length === 0) {
        showWarning("אין שינויים", "לא בוצעו שינויים באיש הקשר");
        setIsSaving(false);
        return;
      }

      const response = await updateContact(formData.id!, updatePayload);

      if (response.success) {
        showSuccess("הצלחה", "איש הקשר עודכן בהצלחה");
        setTimeout(() => onSave(), 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה בעדכון איש הקשר");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
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
    ${
      isDarkMode
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
        className={`rounded-xl border p-6 mb-6 ${
          isDarkMode
            ? "bg-blue-900/20 border-blue-500/50"
            : "bg-blue-50 border-blue-200"
        }`}
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

        <div className="flex flex-wrap items-center gap-4" dir="rtl">
          {/* Name Input */}
          <input
            type="text"
            placeholder="שם מלא"
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
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
                <Save size={18} />
              )}
              <span>{isSaving ? "שומר..." : "שמור"}</span>
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <X size={18} />
              <span>ביטול</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditContactForm;
