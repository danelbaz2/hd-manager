/**
 * TagsFilter - Compact component for filtering by tags
 */
import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../contexts";
import type { PrimaryTagData, SecondaryTagData } from "../../schemas/tagTypes";
import { getTextColor } from "../../schemas/tagTypes";

interface TagsFilterProps {
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  selectedPrimaryIds: string[];
  selectedSecondaryIds: string[];
  onPrimaryChange: (ids: string[]) => void;
  onSecondaryChange: (ids: string[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  primaryTags,
  secondaryTags,
  selectedPrimaryIds,
  selectedSecondaryIds,
  onPrimaryChange,
  onSecondaryChange,
}) => {
  const { isDarkMode } = useTheme();

  const togglePrimary = (id: string) => {
    if (selectedPrimaryIds.includes(id)) {
      onPrimaryChange(selectedPrimaryIds.filter((i) => i !== id));
      const relatedSecondary = secondaryTags
        .filter((st) => st.primaryTagId === id)
        .map((st) => st.id);
      onSecondaryChange(
        selectedSecondaryIds.filter((i) => !relatedSecondary.includes(i))
      );
    } else {
      onPrimaryChange([...selectedPrimaryIds, id]);
    }
  };

  const toggleSecondary = (id: string) => {
    if (selectedSecondaryIds.includes(id)) {
      onSecondaryChange(selectedSecondaryIds.filter((i) => i !== id));
    } else {
      onSecondaryChange([...selectedSecondaryIds, id]);
    }
  };

  const filteredSecondary = secondaryTags.filter((st) =>
    selectedPrimaryIds.includes(st.primaryTagId)
  );

  return (
    <div className="space-y-3">
      {/* Primary Tags */}
      <div className="flex flex-wrap gap-2">
        {primaryTags.map((tag) => {
          const isSelected = selectedPrimaryIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => togglePrimary(tag.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                text-xs font-semibold transition-all
                ${
                  isSelected
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100"
                }
              `}
              style={{
                backgroundColor: tag.color,
                color: getTextColor(tag.color),
              }}
            >
              {isSelected && <Check size={10} />}
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* Secondary Tags */}
      {filteredSecondary.length > 0 && (
        <div
          className={`
            flex flex-wrap gap-2 mt-4 p-3 rounded-lg border border-dashed
            ${
              isDarkMode
                ? "border-slate-700 bg-slate-800/50"
                : "border-slate-200 bg-slate-50/50"
            }
          `}
        >
          {filteredSecondary.map((tag) => {
            const isSelected = selectedSecondaryIds.includes(tag.id);
            const primary = primaryTags.find(
              (pt) => pt.id === tag.primaryTagId
            );
            return (
              <button
                key={tag.id}
                onClick={() => toggleSecondary(tag.id)}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-md
                  text-xs font-medium transition-all
                  ${
                    isSelected
                      ? ""
                      : isDarkMode
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-white text-slate-600 hover:bg-white shadow-sm"
                  }
                `}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${primary?.color || "#3B82F6"}30`,
                        color: primary?.color || "#3B82F6",
                      }
                    : {}
                }
              >
                {isSelected && <Check size={8} />}
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TagsFilter;
