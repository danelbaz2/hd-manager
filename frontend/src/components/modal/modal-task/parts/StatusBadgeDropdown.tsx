import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import {
    STATUS_OPTIONS,
    STATUS_COLORS,
    type TaskStatus,
} from "../../../../schemas/taskTypes";

interface StatusBadgeDropdownProps {
    currentStatus: TaskStatus;
    onStatusSelect: (status: TaskStatus) => void;
    isDarkMode: boolean;
}

export const StatusBadgeDropdown: React.FC<StatusBadgeDropdownProps> = ({
    currentStatus,
    onStatusSelect,
    isDarkMode,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState({ top: 0, right: 0, width: 0 });
    const [hoveredStatus, setHoveredStatus] = useState<TaskStatus | null>(null);

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

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-95 active:scale-95"
                style={{
                    backgroundColor: currentColor.bg,
                    color: currentColor.text,
                }}
            >
                <span>{currentOption?.label}</span>
                <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={`
            fixed z-[99999] py-1.5 rounded-xl border shadow-xl
            flex flex-col gap-1
            ${isDarkMode
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
                        {STATUS_OPTIONS.map((option) => {
                            const isSelected = option.id === currentStatus;
                            const optionColor = STATUS_COLORS[option.id];

                            const isHovered = hoveredStatus === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onStatusSelect(option.id);
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setHoveredStatus(option.id)}
                                    onMouseLeave={() => setHoveredStatus(null)}
                                    style={{
                                        backgroundColor: isHovered
                                            ? isDarkMode
                                                ? `${optionColor.text}40` // Dark mode: Dark color low opacity
                                                : `${optionColor.bg}80`   // Light mode: Light color high opacity
                                            : undefined,
                                        color: isHovered
                                            ? isDarkMode
                                                ? optionColor.bg      // Dark mode: Light text
                                                : optionColor.text    // Light mode: Dark text
                                            : undefined,
                                    }}
                                    className={`
                  group flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-xs font-medium transition-all
                  ${isSelected
                                            ? isDarkMode
                                                ? "bg-slate-700/50"
                                                : "bg-slate-100"
                                            : isDarkMode
                                                ? "hover:bg-slate-700"
                                                : "" // Hover handled by style
                                        }
                `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: optionColor.text }}
                                        />
                                        <span
                                            className={
                                                isDarkMode
                                                    ? "text-slate-200"
                                                    : isHovered
                                                        ? "text-inherit"
                                                        : "text-slate-700"
                                            }
                                        >
                                            {option.label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <Check
                                            className={`w-3.5 h-3.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                                                }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </>
    );
};
