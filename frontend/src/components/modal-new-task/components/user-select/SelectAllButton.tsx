import React from "react";
import { useTheme } from "../../../../contexts/ThemeContext";

interface SelectAllButtonProps {
    allSelected: boolean;
    onToggle: () => void;
}

/**
 * Toggle button for select all / deselect all functionality
 */
const SelectAllButton: React.FC<SelectAllButtonProps> = ({
    allSelected,
    onToggle,
}) => {
    const { isDarkMode } = useTheme();

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${allSelected
                    ? isDarkMode
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    : isDarkMode
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }
      `}
        >
            {allSelected ? (
                <>
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    נקה הכל
                </>
            ) : (
                <>
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    בחר הכל
                </>
            )}
        </button>
    );
};

export default SelectAllButton;
