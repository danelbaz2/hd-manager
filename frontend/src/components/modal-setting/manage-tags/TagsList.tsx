import React, { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type TagData, getTextColor } from "../../../schemas/tagTypes";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import DelayedLoader from "../../common/DelayedLoader";

interface TagsListProps {
  tags: TagData[];
  editingTagId?: string | null;
  onEdit?: (tag: TagData) => void;
  onCancelEdit?: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Tag Card Component with smooth hover
interface TagCardProps {
  tag: TagData;
  isEditing: boolean;
  isDarkMode: boolean;
  onEdit?: (tag: TagData) => void;
  onCancelEdit?: () => void;
  onDelete: (id: string) => void;
}

const TagCard: React.FC<TagCardProps> = ({ tag, isEditing, isDarkMode, onEdit, onCancelEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate colors based on hover state - subtle effect
  const bgOpacity = isHovered
    ? (isDarkMode ? 0.1 : 0.08)
    : (isDarkMode ? 0.06 : 0.04);

  const borderOpacity = isEditing
    ? 0.5
    : isHovered
      ? (isDarkMode ? 0.3 : 0.25)
      : (isDarkMode ? 0.2 : 0.15);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: hexWithAlpha(tag.color, bgOpacity),
        borderColor: hexWithAlpha(tag.color, borderOpacity),
        transition: "background-color 400ms ease, border-color 400ms ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Banner - Static height */}
      <div
        className="w-full h-1"
        style={{ backgroundColor: darkenColor(tag.color, 15) }}
      />

      <div className="flex items-center justify-between px-4 py-3">
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(tag.id)}
            className={`
              p-1.5 rounded-lg transition-colors cursor-pointer
              ${isDarkMode
                ? "text-red-400 hover:bg-red-900/30"
                : "text-red-500 hover:bg-red-50"
              }
            `}
          >
            <Trash2 size={16} />
          </button>
          {onEdit && (
            <button
              onClick={() => isEditing && onCancelEdit ? onCancelEdit() : onEdit(tag)}
              className={`
                p-1.5 rounded-lg transition-colors cursor-pointer
                ${isEditing
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
    </div>
  );
};

const TagsList: React.FC<TagsListProps> = ({
  tags,
  editingTagId,
  onEdit,
  onCancelEdit,
  onDelete,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <DelayedLoader isLoading={isLoading} delay={300}>
      {tags.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <p
            className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            אין תגיות להצגה
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {tags.map((tag) => (
              <TagCard
                key={tag.id}
                tag={tag}
                isEditing={editingTagId === tag.id}
                isDarkMode={isDarkMode}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </DelayedLoader>
  );
};

export default TagsList;
