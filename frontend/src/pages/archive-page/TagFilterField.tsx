import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tags, ChevronDown, X } from "lucide-react";
import type { PrimaryTagData, SecondaryTagData } from "../../schemas/tagTypes";
import { useTheme } from "../../contexts/ThemeContext";

interface TagFilterFieldProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
}

/**
 * TagFilterField - Dropdown tag selector with badge-style tags
 * Opens as an overlay to avoid layout shifts
 */
const TagFilterField: React.FC<TagFilterFieldProps> = ({
  selectedTagIds,
  onChange,
  primaryTags,
  secondaryTags,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0, width: 0 });

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        width: Math.max(rect.width, 400),
      });
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside, true);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen]);

  const box = `relative flex items-center justify-between h-10 rounded-lg border transition-all cursor-pointer ${
    isDarkMode
      ? "bg-slate-800/60 border-slate-600/50 hover:border-slate-500"
      : "bg-slate-50 border-slate-200 hover:border-slate-300"
  }`;

  const displayText =
    selectedTagIds.length === 0
      ? "בחר תגיות..."
      : `${selectedTagIds.length} תגיות נבחרו`;

  return (
    <>
      {/* Selector Button */}
      <div ref={buttonRef} className={box} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 pr-3">
          <Tags className="w-4 h-4 text-slate-400" />
          <span
            className={`text-sm ${
              isDarkMode ? "text-white" : "text-slate-700"
            }`}
          >
            {displayText}
          </span>
        </div>
        <div className="flex items-center gap-2 pl-3">
          {selectedTagIds.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className={`p-1 rounded hover:bg-slate-500/20 transition-colors`}
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`
                            fixed z-[99999] rounded-xl border shadow-2xl p-4
                            max-h-[500px] overflow-y-auto
                            ${
                              isDarkMode
                                ? "bg-slate-800 border-slate-700 dark-scrollbar"
                                : "bg-white border-slate-200 light-scrollbar"
                            }
                        `}
            style={{
              top: position.top,
              right: position.right,
              width: position.width,
            }}
            dir="rtl"
          >
            {/* Primary Tags Section */}
            {primaryTags.length > 0 && (
              <div className="mb-4">
                <div
                  className={`text-xs font-medium mb-2 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  בחר קטגוריה
                </div>
                <div className="flex flex-wrap gap-2">
                  {primaryTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-semibold
                                                    transition-all duration-200
                                                    ${
                                                      isSelected
                                                        ? "ring-[3px] ring-offset-2 scale-[1.05] shadow-lg"
                                                        : "hover:scale-[1.02] opacity-80 hover:opacity-100"
                                                    }
                                                `}
                        style={{
                          backgroundColor: tag.color,
                          color: "#fff",
                          ...(isSelected && {
                            boxShadow: isDarkMode
                              ? `0 0 0 3px ${tag.color}80`
                              : `0 0 0 3px ${tag.color}60, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                          }),
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Secondary Tags Section */}
            {secondaryTags.length > 0 && (
              <div>
                <div
                  className={`text-xs font-medium mb-2 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  בחר קטגוריה משנית כדי לראות תגיות משניות
                </div>
                <div className="flex flex-wrap gap-2">
                  {secondaryTags.map((tag) => {
                    const parent = primaryTags.find(
                      (p) => p.id === tag.primaryTagId
                    );
                    const isSelected = selectedTagIds.includes(tag.id);
                    const color = parent?.color || "#94A3B8";

                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-semibold
                                                    transition-all duration-200
                                                    ${
                                                      isSelected
                                                        ? "ring-[3px] ring-offset-2 scale-[1.05] shadow-lg"
                                                        : "hover:scale-[1.02] opacity-70 hover:opacity-100"
                                                    }
                                                `}
                        style={{
                          backgroundColor: `${color}CC`,
                          color: "#fff",
                          ...(isSelected && {
                            boxShadow: isDarkMode
                              ? `0 0 0 3px ${color}80`
                              : `0 0 0 3px ${color}60, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                          }),
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default TagFilterField;
