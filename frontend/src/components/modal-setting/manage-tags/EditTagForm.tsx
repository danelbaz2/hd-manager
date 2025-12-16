import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type TagFormData, TAG_COLORS } from "../../../schemas/tagTypes";
import { updateTag, type TagFormPayload } from "../../../api/tagsApi";
import { ToastContainer, useToast } from "../../alert-feedback";

interface EditTagFormProps {
  formData: TagFormData;
  setFormData: React.Dispatch<React.SetStateAction<TagFormData>>;
  onSave: () => void;
  onCancel: () => void;
}

const EditTagForm: React.FC<EditTagFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const validateForm = (): boolean => {
    // Validate id exists (required for update)
    if (!formData.id) {
      showWarning("שגיאה", "מזהה תגית חסר");
      return false;
    }

    // Validate name (min 1 char per API docs)
    if (!formData.name || formData.name.length < 1) {
      showWarning("שגיאת אימות", "שם התגית חייב להכיל לפחות תו אחד");
      return false;
    }

    // Validate color (hex format - lowercase per API docs)
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(formData.color)) {
      showWarning("שגיאת אימות", "יש לבחור צבע תקין");
      return false;
    }

    return true;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      console.log("Updating Tag - Form Data:", formData);

      // Build payload for PUT /api/tags/:id
      const payload: Partial<TagFormPayload> = {
        name: formData.name,
        color: formData.color,
        description: formData.description || undefined,
      };

      const response = await updateTag(formData.id!, payload);

      if (response.success) {
        showSuccess("הצלחה", "התגית עודכנה בהצלחה");
        console.log("Tag updated successfully:", response.data);
        setTimeout(() => {
          onSave();
        }, 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה בעדכון התגית");
        console.error("Failed to update tag:", response.error);
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div className="flex items-center justify-end gap-2 mb-4">
        <span
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          עריכת תגית
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4" dir="rtl">
        {/* Name Input */}
        <input
          type="text"
          placeholder="שם התגית"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSaving}
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
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {/* Color Selection */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm mr-2 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            צבע
          </span>
          {TAG_COLORS.map((color) => (
            <button
              key={color.bg}
              onClick={() => setFormData({ ...formData, color: color.bg })}
              disabled={isSaving}
              className={`
                w-6 h-6 rounded-full transition-transform
                ${
                  formData.color === color.bg
                    ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                    : ""
                }
                ${
                  isDarkMode && formData.color === color.bg
                    ? "ring-offset-slate-700"
                    : ""
                }
              `}
              style={{ backgroundColor: color.bg }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveClick}
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
              <Save size={18} />
            )}
            <span>{isSaving ? "שומר..." : "שמור"}</span>
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className={`
              px-4 py-2.5 rounded-lg
              font-medium transition-colors
              ${
                isDarkMode
                  ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTagForm;
