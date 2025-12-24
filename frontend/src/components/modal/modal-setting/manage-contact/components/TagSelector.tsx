import React, { useState } from "react";
import { ChevronDown, X, Loader2 } from "lucide-react";
import {
  type PrimaryTagData,
  getTextColor,
} from "../../../../../schemas/tagTypes";

interface TagSelectorProps {
  selectedTagIds: string[];
  availableTags: PrimaryTagData[];
  isDarkMode: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  loadingText?: string;
  emptyText?: string;
  onToggleTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}

/**
 * TagSelector - Multi-select dropdown for primary tags
 * Used in contact forms for category selection
 */
const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  availableTags,
  isDarkMode,
  isLoading = false,
  isDisabled = false,
  placeholder = "בחר קטגוריות",
  loadingText = "טוען תגיות...",
  emptyText = "אין תגיות",
  onToggleTag,
  onRemoveTag,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getTagById = (tagId: string): PrimaryTagData | undefined => {
    return availableTags.find((tag) => tag.id === tagId);
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      {/* Trigger */}
      <div
        role="button"
        onClick={() =>
          !isDisabled && !isLoading && setIsDropdownOpen(!isDropdownOpen)
        }
        className={`
          w-full px-3 py-2 cursor-pointer
          rounded-lg border text-right
          flex items-start justify-between gap-2
          transition-colors min-h-[42px]
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-600 text-white"
              : "bg-white border-slate-200 text-slate-800"
          }
          ${isDisabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        `}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin mt-1" />
        ) : (
          <ChevronDown
            size={18}
            className={`transition-transform flex-shrink-0 mt-1 ${
              isDropdownOpen ? "rotate-180" : ""
            } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          />
        )}
        <div
          className={`flex-1 flex flex-wrap gap-1.5 justify-end max-h-[80px] overflow-y-auto ${
            isDarkMode ? "dark-scrollbar" : "light-scrollbar"
          }`}
        >
          {selectedTagIds.length === 0 ? (
            <span
              className={`py-0.5 ${
                isDarkMode ? "text-slate-400" : "text-slate-400"
              }`}
            >
              {isLoading
                ? loadingText
                : availableTags.length === 0
                ? emptyText
                : placeholder}
            </span>
          ) : (
            selectedTagIds.map((tagId: string) => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              return (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                  style={{
                    backgroundColor: tag.color,
                    color: getTextColor(tag.color),
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTag(tag.id);
                    }}
                    className="hover:opacity-70 flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && availableTags.length > 0 && (
        <div
          className={`
            absolute top-full left-0 right-0 mt-1 z-10
            rounded-lg border shadow-lg
            max-h-48 overflow-y-auto
            ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-200"
            }
          `}
        >
          {availableTags.map((tag: PrimaryTagData) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggleTag(tag.id)}
              className={`
                w-full px-4 py-2 text-right
                flex items-center justify-between
                transition-colors
                ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}
                ${
                  selectedTagIds.includes(tag.id)
                    ? isDarkMode
                      ? "bg-slate-700"
                      : "bg-slate-100"
                    : ""
                }
              `}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center
                  ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-blue-500 border-blue-500"
                      : isDarkMode
                      ? "border-slate-500"
                      : "border-slate-300"
                  }
                `}
              >
                {selectedTagIds.includes(tag.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: tag.color,
                  color: getTextColor(tag.color),
                }}
              >
                {tag.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
