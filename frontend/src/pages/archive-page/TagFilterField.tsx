import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Tags, ChevronDown, X, Search } from "lucide-react";
import type { PrimaryTagData, SecondaryTagData } from "../../schemas/tagTypes";
import { useTheme } from "../../contexts/ThemeContext";

interface TagFilterFieldProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
}

/**
 * TagFilterField - Dropdown tag selector with badge-style tags and search
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
  const [searchQuery, setSearchQuery] = useState("");
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Filter tags based on search query
  const filteredPrimaryTags = useMemo(() => {
    if (!searchQuery.trim()) return primaryTags;
    const query = searchQuery.toLowerCase().trim();
    return primaryTags.filter((tag) => 
      tag.name.toLowerCase().includes(query)
    );
  }, [primaryTags, searchQuery]);

  const filteredSecondaryTags = useMemo(() => {
    if (!searchQuery.trim()) return secondaryTags;
    const query = searchQuery.toLowerCase().trim();
    return secondaryTags.filter((tag) => 
      tag.name.toLowerCase().includes(query)
    );
  }, [secondaryTags, searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the portal is rendered
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    // Clear search when closing
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

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

  const hasResults = filteredPrimaryTags.length > 0 || filteredSecondaryTags.length > 0;

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
                            fixed z-[99999] rounded-xl border shadow-2xl
                            max-h-[500px] overflow-hidden flex flex-col
                            ${
                              isDarkMode
                                ? "bg-slate-800 border-slate-700"
                                : "bg-white border-slate-200"
                            }
                        `}
            style={{
              top: position.top,
              right: position.right,
              width: position.width,
            }}
            dir="rtl"
          >
            {/* Search Input */}
            <div className={`p-3 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
              }`}>
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש תגית..."
                  className={`w-full bg-transparent text-sm outline-none ${
                    isDarkMode 
                      ? "text-white placeholder-slate-400" 
                      : "text-slate-800 placeholder-slate-500"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 rounded hover:bg-slate-500/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Tags Content */}
            <div className={`p-4 overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}>
              {!hasResults ? (
                <div className={`text-sm text-center py-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  לא נמצאו תגיות התואמות לחיפוש
                </div>
              ) : (
                <>
                  {/* Primary Tags Section */}
                  {filteredPrimaryTags.length > 0 && (
                    <div className="mb-4">
                      <div
                        className={`text-xs font-medium mb-2 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        קטגוריות ראשיות
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredPrimaryTags.map((tag) => {
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
                  {filteredSecondaryTags.length > 0 && (
                    <div>
                      <div
                        className={`text-xs font-medium mb-2 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        תגיות משניות
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredSecondaryTags.map((tag) => {
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
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default TagFilterField;
