import React from "react";
import {
  type PrimaryTagData,
  type SecondaryTagData,
  getLighterColor,
} from "../../../schemas/tagTypes";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import TagCard from "./TagCard";

export interface SecondaryTagsListProps {
  secondaryTags: SecondaryTagData[];
  primaryTags: PrimaryTagData[];
  editingId: string | null;
  isDarkMode: boolean;
  onEdit: (tag: SecondaryTagData) => void;
  onCancelEdit: () => void;
  onDeleteRequest: (tag: SecondaryTagData) => void;
}

/**
 * SecondaryTagsList - Grid list of secondary tags with edit/delete actions
 */
const SecondaryTagsList: React.FC<SecondaryTagsListProps> = ({
  secondaryTags,
  primaryTags,
  editingId,
  isDarkMode,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) => {
  // Helper to get primary tag by ID
  const getPrimaryById = (id: string) => primaryTags.find((pt) => pt.id === id);

  if (secondaryTags.length === 0) {
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
    <div
      className={`flex-1 overflow-y-auto ${
        isDarkMode ? "dark-scrollbar" : "light-scrollbar"
      }`}
    >
      <div className="grid grid-cols-2 gap-3">
        {secondaryTags.map((tag) => {
          const isTagEditing = editingId === tag.id;
          const parentTag = getPrimaryById(tag.primaryTagId);
          const displayColor = parentTag
            ? getLighterColor(parentTag.color)
            : "#93C5FD";

          return (
            <TagCard
              key={tag.id}
              color={displayColor}
              name={tag.name}
              description={tag.description}
              badge={
                parentTag && (
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: hexWithAlpha(
                        parentTag.color,
                        isDarkMode ? 0.3 : 0.15
                      ),
                      color: isDarkMode
                        ? getLighterColor(parentTag.color)
                        : darkenColor(parentTag.color, 20),
                    }}
                  >
                    {parentTag.name}
                  </span>
                )
              }
              isEditing={isTagEditing}
              isDarkMode={isDarkMode}
              onEdit={() => onEdit(tag)}
              onCancelEdit={onCancelEdit}
              onDeleteRequest={() => onDeleteRequest(tag)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SecondaryTagsList;
