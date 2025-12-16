import React, { useState } from "react";
import { Tag } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type TagFormData,
  TAG_COLORS,
  DEFAULT_TAG_FORM,
} from "../../../schemas/tagTypes";

interface AddTagFormProps {
  onAdd: (tag: TagFormData) => void;
}

const AddTagForm: React.FC<AddTagFormProps> = ({ onAdd }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<TagFormData>(DEFAULT_TAG_FORM);

  const handleSubmit = () => {
    if (!formData.name) return;
    onAdd(formData);
    setFormData(DEFAULT_TAG_FORM);
  };

  return (
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

        {/* Add Button */}
        <button
          onClick={handleSubmit}
          className="
            flex items-center gap-2
            px-6 py-2.5 rounded-lg
            bg-blue-500 hover:bg-blue-600
            text-white font-medium
            transition-colors
          "
        >
          הוסף
        </button>
      </div>
    </div>
  );
};

export default AddTagForm;
