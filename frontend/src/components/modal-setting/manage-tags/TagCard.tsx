import React, { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import { getTextColor } from "../../../schemas/tagTypes";
import { Tooltip } from "../../tags-tooltip";

export interface TagCardProps {
  color: string;
  name: string;
  description?: string | null;
  badge?: React.ReactNode;
  isEditing: boolean;
  isDarkMode: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDeleteRequest: () => void;
}

/**
 * TagCard - Reusable card component for displaying a tag
 * Used for both primary and secondary tags in the tags management UI
 */
const TagCard: React.FC<TagCardProps> = ({
  color,
  name,
  description,
  badge,
  isEditing,
  isDarkMode,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const bgOpacity = isHovered
    ? isDarkMode
      ? 0.1
      : 0.08
    : isDarkMode
    ? 0.06
    : 0.04;

  const borderOpacity = isEditing
    ? 0.5
    : isHovered
    ? isDarkMode
      ? 0.3
      : 0.25
    : isDarkMode
    ? 0.2
    : 0.15;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: hexWithAlpha(color, bgOpacity),
        borderColor: hexWithAlpha(color, borderOpacity),
        transition: "background-color 400ms ease, border-color 400ms ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Banner */}
      <div
        className="w-full h-1"
        style={{ backgroundColor: darkenColor(color, 15) }}
      />

      <div className="flex items-center justify-between px-4 py-3">
        {/* Actions */}
        <div className="flex items-center gap-1">
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest();
            }}
            className={`
                            p-1.5 rounded-lg transition-colors cursor-pointer
                            ${
                              isDarkMode
                                ? "text-red-400 hover:bg-red-900/30"
                                : "text-red-500 hover:bg-red-50"
                            }
                        `}
          >
            <Trash2 size={16} />
          </div>
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                onCancelEdit();
              } else {
                onEdit();
              }
            }}
            className={`
                            p-1.5 rounded-lg transition-colors cursor-pointer
                            ${
                              isEditing
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                ? "text-blue-400 hover:bg-blue-900/30"
                                : "text-blue-500 hover:bg-blue-50"
                            }
                        `}
          >
            <Pencil size={16} />
          </div>
        </div>

        {/* Right side: Badge + Tag */}
        <div className="flex items-center gap-3">
          {badge}
          <Tooltip content={description} position="top">
            <span
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-default"
              style={{
                backgroundColor: color,
                color: getTextColor(color),
              }}
            >
              {name}
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TagCard;
