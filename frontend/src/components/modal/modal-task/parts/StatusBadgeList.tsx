import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  STATUS_OPTIONS,
  STATUS_COLORS,
  type TaskStatus,
} from "../../../../schemas/taskTypes";

interface StatusBadgeListProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  position: { top: number; right: number; width: number };
  isDarkMode: boolean;
  currentStatus: TaskStatus;
  onStatusSelect: (status: TaskStatus) => void;
  onClose: () => void;
}

export const StatusBadgeList: React.FC<StatusBadgeListProps> = ({
  dropdownRef,
  position,
  isDarkMode,
  currentStatus,
  onStatusSelect,
  onClose,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<TaskStatus | null>(null);

  return (
    <div
      ref={dropdownRef}
      className={`
            fixed z-[99999] py-1.5 rounded-xl border shadow-xl
            flex flex-col gap-1
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
      {STATUS_OPTIONS.map((option) => {
        const isSelected = option.id === currentStatus;
        const optionColor = STATUS_COLORS[option.id];
        const isHovered = hoveredStatus === option.id;

        return (
          <button
            key={option.id}
            onClick={() => {
              onStatusSelect(option.id);
              onClose();
            }}
            onMouseEnter={() => setHoveredStatus(option.id)}
            onMouseLeave={() => setHoveredStatus(null)}
            style={{
              backgroundColor: isHovered
                ? isDarkMode
                  ? `${optionColor.text}40`
                  : `${optionColor.bg}80`
                : undefined,
              color: isHovered
                ? isDarkMode
                  ? optionColor.bg
                  : optionColor.text
                : undefined,
            }}
            className={`
                  group flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    isSelected
                      ? isDarkMode
                        ? "bg-slate-700/50"
                        : "bg-slate-100"
                      : isDarkMode
                      ? "hover:bg-slate-700"
                      : ""
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
                className={`w-3.5 h-3.5 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
