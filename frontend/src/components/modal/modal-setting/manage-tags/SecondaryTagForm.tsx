import React from "react";
import { Layers, Loader2, ChevronDown } from "lucide-react";
import {
  type PrimaryTagData,
  type SecondaryTagFormData,
  TAG_COLORS,
} from "../../../../schemas/tagTypes";
import { darkenColor, hexWithAlpha } from "../../../../utils/colorUtils";

export interface SecondaryTagFormProps {
  formData: SecondaryTagFormData;
  primaryTags: PrimaryTagData[];
  isEditing: boolean;
  isSaving: boolean;
  isDarkMode: boolean;
  onFormChange: (data: SecondaryTagFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * SecondaryTagForm - Form for adding/editing secondary tags
 */
const SecondaryTagForm: React.FC<SecondaryTagFormProps> = ({
  formData,
  primaryTags,
  isEditing,
  isSaving,
  isDarkMode,
  onFormChange,
  onSubmit,
  onCancel,
}) => {
  // Get parent tag color for form styling
  const parentTag = primaryTags.find((pt) => pt.id === formData.primaryTagId);
  const formColor = parentTag?.color || TAG_COLORS[0].bg;

  return (
    <div
      className="rounded-xl border mb-6 overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: hexWithAlpha(formColor, isDarkMode ? 0.1 : 0.08),
        borderColor: hexWithAlpha(formColor, isDarkMode ? 0.3 : 0.25),
      }}
    >
      {/* Color Banner */}
      <div
        className="h-2 w-full transition-colors duration-300"
        style={{ backgroundColor: darkenColor(formColor, 20) }}
      />

      <div className="p-6">
        <div className="flex items-center justify-end gap-2 mb-4">
          <span
            className={`font-medium ${
              isDarkMode ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {isEditing ? "עריכת תגית" : "הוספת תגית חדשה"}
          </span>
          <Layers size={18} className="text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-4" dir="rtl">
          {/* Primary Category Selector */}
          <div className="relative min-w-[160px]">
            <select
              value={formData.primaryTagId}
              onChange={(e) =>
                onFormChange({ ...formData, primaryTagId: e.target.value })
              }
              disabled={isSaving}
              dir="rtl"
              className={`
                                w-full px-4 py-2.5 pl-10 rounded-lg border text-right appearance-none cursor-pointer
                                text-sm font-medium
                                transition-colors
                                ${
                                  isDarkMode
                                    ? "bg-slate-700 border-slate-600 text-white"
                                    : "bg-white border-slate-300 text-slate-800"
                                }
                                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
            >
              <option value="">בחר קטגוריה</option>
              {primaryTags.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
          </div>

          {/* Name Input */}
          <input
            type="text"
            placeholder="שם התגית"
            value={formData.name}
            onChange={(e) =>
              onFormChange({ ...formData, name: e.target.value })
            }
            disabled={isSaving}
            className={`
                            flex-1 min-w-[180px] px-4 py-2.5
                            rounded-lg border text-right text-sm
                            transition-colors
                            ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
          />

          {/* Description Input */}
          <input
            type="text"
            placeholder="תיאור קצר"
            value={formData.description || ""}
            onChange={(e) =>
              onFormChange({ ...formData, description: e.target.value })
            }
            disabled={isSaving}
            maxLength={50}
            className={`
                            flex-1 min-w-[180px] px-4 py-2.5
                            rounded-lg border text-right text-sm
                            transition-colors
                            ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
          />

          {/* Cancel Button (when editing) */}
          {isEditing && (
            <button
              onClick={onCancel}
              disabled={isSaving}
              className={`
                                px-4 py-2.5 rounded-lg font-medium transition-colors
                                ${
                                  isDarkMode
                                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
            >
              ביטול
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={onSubmit}
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
              <Layers size={18} />
            )}
            <span>{isSaving ? "שומר..." : isEditing ? "עדכן" : "הוסף"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryTagForm;
