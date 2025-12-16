import React from "react";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type TagData, getTextColor } from "../../../schemas/tagTypes";

interface TagsListProps {
  tags: TagData[];
  editingTagId?: string | null;
  onEdit?: (tag: TagData) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  editingTagId,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <Loader2
          size={32}
          className={`animate-spin ${
            isDarkMode ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p
          className={`text-center ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          אין תגיות להצגה
        </p>
      </div>
    );
  }

  return (
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
                editingTagId === tag.id
                  ? isDarkMode
                    ? "bg-blue-900/20 border-blue-500/50"
                    : "bg-blue-50 border-blue-200"
                  : isDarkMode
                  ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(tag.id)}
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
              {onEdit && (
                <button
                  onClick={() => onEdit(tag)}
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${
                      editingTagId === tag.id
                        ? "bg-blue-500 text-white"
                        : isDarkMode
                        ? "text-blue-400 hover:bg-blue-900/30"
                        : "text-blue-500 hover:bg-blue-50"
                    }
                  `}
                >
                  <Pencil size={16} />
                </button>
              )}
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
  );
};

export default TagsList;
