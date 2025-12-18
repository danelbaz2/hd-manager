import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type TagData, getTextColor } from "../../../schemas/tagTypes";

interface TagsSelectProps {
  tags: TagData[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  isLoading?: boolean;
}

const TagsSelect: React.FC<TagsSelectProps> = ({
  tags,
  selectedTagIds,
  onChange,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  // Remove tag
  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <label
        className={`
          block text-sm lg:text-base font-medium mb-2
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        תגיות
      </label>

      {/* Selected Tags Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full min-h-[48px] flex items-center justify-between gap-2
          px-3 py-2
          rounded-xl border-2
          text-sm lg:text-base
          transition-all duration-200
          ${isDarkMode
            ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
            : "bg-white border-slate-200 hover:border-slate-300"
          }
          ${isOpen
            ? isDarkMode
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-blue-500 ring-2 ring-blue-500/20"
            : ""
          }
        `}
      >
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        />

        <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
          {selectedTags.length === 0 ? (
            <span className={isDarkMode ? "text-slate-400" : "text-slate-400"}>
              בחר תגיות...
            </span>
          ) : (
            selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: tag.color,
                  color: getTextColor(tag.color),
                }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => removeTag(tag.id, e)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 right-0 left-0 z-30
            max-h-48 overflow-y-auto
            ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
            py-2 rounded-xl border-2 shadow-xl
            ${isDarkMode
              ? "bg-slate-800 border-slate-600 dark-scrollbar"
              : "bg-white border-slate-200 light-scrollbar"
            }
          `}
        >
          {isLoading ? (
            <div
              className={`px-4 py-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              טוען תגיות...
            </div>
          ) : tags.length === 0 ? (
            <div
              className={`px-4 py-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              אין תגיות זמינות
            </div>
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    w-full flex items-center justify-end gap-3
                    px-4 py-2.5
                    text-sm lg:text-base
                    transition-colors
                    ${isSelected
                      ? isDarkMode
                        ? "bg-blue-900/40"
                        : "bg-blue-50"
                      : isDarkMode
                        ? "hover:bg-slate-700"
                        : "hover:bg-slate-50"
                    }
                  `}
                >
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: tag.color,
                      color: getTextColor(tag.color),
                    }}
                  >
                    {tag.name}
                  </span>
                  <div
                    className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center
                      transition-colors
                      ${isSelected
                        ? "bg-blue-500 border-blue-500"
                        : isDarkMode
                          ? "border-slate-500"
                          : "border-slate-300"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TagsSelect;
