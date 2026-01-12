/**
 * MilitaryUnitSelect - Autocomplete dropdown for military unit fields
 * 
 * Features:
 * - Searchable dropdown with filtered suggestions
 * - Auto-complete parent fields on selection (click or Enter)
 * - Beautiful RTL-friendly design matching existing components
 * - Keyboard navigation support
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";

interface MilitaryUnitSelectProps {
  /** Label for the field */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Current value */
  value: string;
  /** Available options to choose from */
  options: string[];
  /** Called when user types */
  onInputChange: (value: string) => void;
  /** Called when user selects an option (click or Enter) */
  onSelect: (value: string) => void;
  /** Input class for styling */
  inputClassName?: string;
}

export const MilitaryUnitSelect: React.FC<MilitaryUnitSelectProps> = ({
  label,
  placeholder,
  value,
  options,
  onInputChange,
  onSelect,
  inputClassName,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  // Filter options based on current input
  const filteredOptions = useMemo(() => {
    if (!value.trim()) return options;
    return options.filter((opt) => opt.includes(value));
  }, [options, value]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setIsPositioned(true);
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Update position on scroll (instead of closing) and close on resize
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };
    
    const handleResize = () => {
      if (isOpen) setIsOpen(false);
    };
    
    // Update position on scroll (keeps dropdown aligned with input)
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
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

  // Handle option selection
  const handleSelect = useCallback((option: string) => {
    onSelect(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          // Auto-select if only one option matches
          handleSelect(filteredOptions[0]);
        } else if (value.trim() && !filteredOptions.includes(value)) {
          // Allow custom value if not in list
          onSelect(value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, handleSelect, value, onSelect]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-option]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const inputBaseClass = `
    w-full px-3 py-1.5 rounded-xl border-2 text-sm transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
  `;

  return (
    <div ref={containerRef} className="relative">
      <label
        className={`block text-xs font-medium mb-1 ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onInputChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={inputClassName || `
            ${inputBaseClass}
            ${isDarkMode
              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
            }
            ${isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
          `}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
            isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-600"
          }`}
          tabIndex={-1}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown Portal - only render when positioned */}
      {isOpen && isPositioned && filteredOptions.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          className={`
            fixed z-[99999] overflow-hidden
            rounded-xl border-2 shadow-2xl
            ${isDarkMode
              ? "bg-slate-800 border-slate-600"
              : "bg-white border-slate-200"
            }
          `}
          style={{
            top: position.top,
            left: position.left,
            width: Math.max(position.width, 140),
            maxHeight: 200,
          }}
          dir="rtl"
        >
          {/* Header hint */}
          <div
            className={`px-3 py-1.5 text-xs font-medium border-b flex items-center gap-2 ${
              isDarkMode
                ? "bg-slate-700/50 text-slate-400 border-slate-700"
                : "bg-slate-50 text-slate-500 border-slate-100"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>בחר {label}</span>
          </div>
          
          {/* Options list with themed scrollbar */}
          <div className={`overflow-y-auto max-h-[150px] py-1 ${isDarkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
            {filteredOptions.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = option === value;

              return (
                <button
                  key={option}
                  data-option
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full text-right px-3 py-2
                    text-sm font-medium
                    flex items-center justify-between gap-2
                    transition-colors duration-100
                    ${isHighlighted
                      ? isDarkMode
                        ? "bg-blue-600/30 text-blue-300"
                        : "bg-blue-50 text-blue-600"
                      : isSelected
                        ? isDarkMode
                          ? "bg-slate-700/50 text-white"
                          : "bg-slate-50 text-slate-800"
                        : isDarkMode
                          ? "text-slate-300 hover:bg-slate-700/50"
                          : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="font-mono">{option}</span>
                  {isSelected && (
                    <Check className={`w-4 h-4 ${
                      isDarkMode ? "text-blue-400" : "text-blue-500"
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Empty state when no options match - only render when positioned */}
      {isOpen && isPositioned && value.trim() && filteredOptions.length === 0 && createPortal(
        <div
          ref={dropdownRef}
          className={`
            fixed z-[99999] overflow-hidden
            rounded-xl border-2 shadow-2xl
            ${isDarkMode
              ? "bg-slate-800 border-slate-600"
              : "bg-white border-slate-200"
            }
          `}
          style={{
            top: position.top,
            left: position.left,
            width: Math.max(position.width, 140),
          }}
          dir="rtl"
        >
          <div
            className={`px-3 py-3 text-xs text-center ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            לא נמצאו תוצאות
            <div className="mt-1 text-xs opacity-70">
              לחץ Enter להזין ערך חופשי
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MilitaryUnitSelect;
