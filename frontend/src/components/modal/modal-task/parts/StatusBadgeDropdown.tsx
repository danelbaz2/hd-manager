import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  STATUS_OPTIONS,
  STATUS_COLORS,
  type TaskStatus,
} from "../../../../schemas/taskTypes";
import { StatusBadgeList } from "./StatusBadgeList";

interface StatusBadgeDropdownProps {
  currentStatus: TaskStatus;
  onStatusSelect: (status: TaskStatus) => void;
  isDarkMode: boolean;
  disabled?: boolean;
}

export const StatusBadgeDropdown: React.FC<StatusBadgeDropdownProps> = ({
  currentStatus,
  onStatusSelect,
  isDarkMode,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ top: 0, right: 0, width: 0 });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentOption = STATUS_OPTIONS.find((s) => s.id === currentStatus);
  const currentColor = STATUS_COLORS[currentStatus] || STATUS_COLORS.pending;

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right, // Align right edge for RTL
        width: Math.max(rect.width, 180), // Minimum width for dropdown
      });
    }
  }, [isOpen]);

  // Handle scroll/resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                ${
                  disabled
                    ? ""
                    : "transition-all hover:brightness-95 active:scale-95"
                }`}
        style={{
          backgroundColor: currentColor.bg,
          color: currentColor.text,
        }}
      >
        <span>{currentOption?.label}</span>
        {!disabled && (
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen &&
        !disabled &&
        createPortal(
          <StatusBadgeList
            dropdownRef={dropdownRef}
            position={position}
            isDarkMode={isDarkMode}
            currentStatus={currentStatus}
            onStatusSelect={onStatusSelect}
            onClose={() => setIsOpen(false)}
          />,
          document.body
        )}
    </>
  );
};
