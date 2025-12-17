import React, { useState } from "react";
import { Tag, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type TagFormData,
  TAG_COLORS,
  DEFAULT_TAG_FORM,
} from "../../../schemas/tagTypes";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import { createTag, type TagFormPayload } from "../../../api/tagsApi";
import { ToastContainer, useToast } from "../../alert-feedback";

interface AddTagFormProps {
  onAdd: () => void;
}

const AddTagForm: React.FC<AddTagFormProps> = ({ onAdd }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<TagFormData>(DEFAULT_TAG_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const validateForm = (): boolean => {
    // Validate name (min 1 char per API docs)
    if (!formData.name || formData.name.length < 1) {
      showWarning("שגיאת אימות", "שם התגית חייב להכיל לפחות תו אחד");
      return false;
    }

    // Validate color (hex format)
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(formData.color)) {
      showWarning("שגיאת אימות", "יש לבחור צבע תקין");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      // Build payload for POST /api/tags
      const payload: TagFormPayload = {
        name: formData.name,
        color: formData.color,
        description: formData.description || undefined,
      };

      const response = await createTag(payload);

      if (response.success) {
        showSuccess("הצלחה", "התגית נוספה בהצלחה");
        setFormData(DEFAULT_TAG_FORM);
        setTimeout(() => {
          onAdd();
        }, 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה ביצירת התגית");
        console.error("Failed to create tag:", response.error);
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div
        className="rounded-xl border mb-6 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: hexWithAlpha(formData.color, isDarkMode ? 0.1 : 0.08),
          borderColor: hexWithAlpha(formData.color, isDarkMode ? 0.3 : 0.25),
        }}
      >
        {/* Color Banner - Darker shade */}
        <div
          className="h-2 w-full transition-colors duration-300"
          style={{ backgroundColor: darkenColor(formData.color, 20) }}
        />

        <div className="p-6">
          <div className="flex items-center justify-end gap-2 mb-4">
            <span
              className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"
                }`}
            >
              הוספת תגית חדשה
            </span>
            <Tag size={18} className="text-slate-400" />
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
              ${isDarkMode
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
                className={`text-sm mr-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              ></span>
              {TAG_COLORS.map((color) => (
                <button
                  key={color.bg}
                  onClick={() => setFormData({ ...formData, color: color.bg })}
                  disabled={isSaving}
                  className={`
                  w-6 h-6 rounded-full transition-transform
                  ${formData.color === color.bg
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                      : ""
                    }
                  ${isDarkMode && formData.color === color.bg
                      ? "ring-offset-slate-700"
                      : ""
                    }
                `}
                  style={{ backgroundColor: color.bg }}
                />
              ))}
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
                <Tag size={18} />
              )}
              <span>{isSaving ? "מוסיף..." : "הוסף"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTagForm;

