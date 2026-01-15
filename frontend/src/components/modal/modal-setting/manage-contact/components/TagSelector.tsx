import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  selectionMode?: "single" | "multiple";
  onSelectSingle?: (tagId: string) => void;
  onToggleTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  usePortal?: boolean;
  hideSelector?: boolean;
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
  selectionMode = "multiple",
  onSelectSingle,
  onToggleTag,
  onRemoveTag,
  usePortal = false,
  hideSelector = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePos = () => {
    const rect = dropdownRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Track position for portal menu
  useEffect(() => {
    if (!isDropdownOpen || !usePortal) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isDropdownOpen, usePortal]);

  const getTagById = (tagId: string): PrimaryTagData | undefined =>
    availableTags.find((tag) => tag.id === tagId);

  const handleOptionClick = (tagId: string) => {
    if (selectionMode === "single") {
      onSelectSingle?.(tagId);
      setIsDropdownOpen(false);
      return;
    }
    onToggleTag(tagId);
  };

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-[200px]">
      {/* Trigger */}
      <div
        role="button"
        onClick={() => {
          if (isDisabled || isLoading) return;
          if (!isDropdownOpen && usePortal) updatePos();
          setIsDropdownOpen((open) => !open);
        }}
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
        usePortal && menuPos
          ? createPortal(
              <Menu
                ref={menuRef}
                isDarkMode={isDarkMode}
                selectedTagIds={selectedTagIds}
                selectionMode={selectionMode}
                availableTags={availableTags}
                onSelect={handleOptionClick}
                hideSelector={hideSelector}
                style={{ position: "absolute", top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999 }}
              />,
              document.body
            )
          : (
              <Menu
                ref={menuRef}
                isDarkMode={isDarkMode}
                selectedTagIds={selectedTagIds}
                selectionMode={selectionMode}
                availableTags={availableTags}
                onSelect={handleOptionClick}
                hideSelector={hideSelector}
                className="absolute top-full left-0 right-0 mt-1 z-20"
              />
            )
      )}
    </div>
  );
};

export default TagSelector;

type MenuProps = {
  isDarkMode: boolean;
  selectedTagIds: string[];
  selectionMode: "single" | "multiple";
  availableTags: PrimaryTagData[];
  onSelect: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  hideSelector?: boolean;
};

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      isDarkMode,
      selectedTagIds,
      selectionMode,
      availableTags,
      onSelect,
      className = "",
      style,
      hideSelector = false,
    },
    ref
  ) => (
    <div
      ref={ref}
      className={`
        rounded-lg border shadow-lg
        max-h-48 overflow-y-auto
        ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
        ${isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}
        ${className}
      `}
      style={style}
    >
      {availableTags.map((tag: PrimaryTagData) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onSelect(tag.id)}
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
          {!hideSelector && (
            selectionMode === "single" ? (
              <span
                className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                  selectedTagIds.includes(tag.id)
                    ? "border-blue-500 bg-blue-500"
                    : isDarkMode
                    ? "border-slate-500"
                    : "border-slate-300"
                }`}
              />
            ) : (
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
            )
          )}
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
  )
);
Menu.displayName = "TagSelectorMenu";
