import React from "react";
import {
  type PrimaryTagData,
  type SecondaryTagData,
} from "../../../../schemas/tagTypes";
import TagCard from "./TagCard";

export interface PrimaryTagsListProps {
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  editingId: string | null;
  isDarkMode: boolean;
  onEdit: (tag: PrimaryTagData) => void;
  onCancelEdit: () => void;
  onDeleteRequest: (tag: PrimaryTagData) => void;
}

/**
 * PrimaryTagsList - Grid list of primary tags with edit/delete actions
 */
const PrimaryTagsList: React.FC<PrimaryTagsListProps> = ({
  primaryTags,
  secondaryTags,
  editingId,
  isDarkMode,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) => {
  if (primaryTags.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p
          className={`text-center ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          אין קטגוריות להצגה
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
        {primaryTags.map((tag) => {
          const isTagEditing = editingId === tag.id;
          const childCount = secondaryTags.filter(
            (st) => st.primaryTagId === tag.id
          ).length;

          return (
            <TagCard
              key={tag.id}
              color={tag.color}
              name={tag.name}
              description={tag.description}
              badge={
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  ({childCount} תגיות)
                </span>
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

export default PrimaryTagsList;
