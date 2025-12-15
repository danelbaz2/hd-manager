import React, { useState } from "react";
import { Tag, Trash2, Pencil } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface TagData {
  id: string;
  name: string;
  color: string;
}

const TAG_COLORS = [
  { bg: "#DBEAFE", text: "#1D4ED8" }, // Blue
  { bg: "#D1FAE5", text: "#047857" }, // Green
  { bg: "#FEF3C7", text: "#B45309" }, // Yellow
  { bg: "#FCE7F3", text: "#BE185D" }, // Pink
  { bg: "#E0E7FF", text: "#4338CA" }, // Indigo
  { bg: "#FEE2E2", text: "#DC2626" }, // Red
  { bg: "#F3E8FF", text: "#7C3AED" }, // Purple
  { bg: "#ECFEFF", text: "#0891B2" }, // Cyan
  { bg: "#FED7AA", text: "#C2410C" }, // Orange
];

const ManageTags: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [tags, setTags] = useState<TagData[]>([
    { id: "1", name: "פיתוח", color: "#DBEAFE" },
    { id: "2", name: "עיצוב", color: "#FEF3C7" },
    { id: "3", name: "שרתים", color: "#E0E7FF" },
    { id: "4", name: "בדיקות", color: "#FEE2E2" },
    { id: "5", name: "דחיפות גבוהה", color: "#FCE7F3" },
    { id: "6", name: "ניהול", color: "#DBEAFE" },
  ]);

  const [newTag, setNewTag] = useState({ name: "", color: TAG_COLORS[0].bg });

  const handleAddTag = () => {
    if (!newTag.name) return;

    const tag: TagData = {
      id: Date.now().toString(),
      name: newTag.name,
      color: newTag.color,
    };

    setTags([...tags, tag]);
    setNewTag({ name: "", color: TAG_COLORS[0].bg });
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const getTextColor = (bgColor: string) => {
    const colorSet = TAG_COLORS.find((c) => c.bg === bgColor);
    return colorSet?.text || "#374151";
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        ניהול תגיות משימה
      </h1>

      {/* Add New Tag Form */}
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
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
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
                onClick={() => setNewTag({ ...newTag, color: color.bg })}
                className={`
                  w-6 h-6 rounded-full transition-transform
                  ${
                    newTag.color === color.bg
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                      : ""
                  }
                  ${
                    isDarkMode && newTag.color === color.bg
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
            onClick={handleAddTag}
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

      {/* Tags Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`
                flex items-center justify-between
                px-4 py-3 rounded-xl border
                transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${
                      isDarkMode
                        ? "text-red-400 hover:bg-red-900/30"
                        : "text-red-500 hover:bg-red-50"
                    }
                  `}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${
                      isDarkMode
                        ? "text-blue-400 hover:bg-blue-900/30"
                        : "text-blue-500 hover:bg-blue-50"
                    }
                  `}
                >
                  <Pencil size={16} />
                </button>
              </div>

              {/* Tag Badge */}
              <span
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: tag.color,
                  color: getTextColor(tag.color),
                }}
              >
                {tag.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageTags;
