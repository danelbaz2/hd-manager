import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
    type PrimaryTagData,
    type SecondaryTagData,
    getLighterColor,
    getTextColor,
} from "../../../../schemas/tagTypes";

interface TagDropdownContentProps {
    primaryTags: PrimaryTagData[];
    secondaryTags: SecondaryTagData[];
    selectedPrimaryIds: string[];
    selectedSecondaryTagIds: string[];
    groupedSecondaryTags: Record<string, SecondaryTagData[]>;
    onTogglePrimary: (primaryId: string) => void;
    onToggleSecondary: (tagId: string) => void;
    isLoading: boolean;
}

/**
 * Dropdown content for selecting primary and secondary tags
 */
const TagDropdownContent: React.FC<TagDropdownContentProps> = ({
    primaryTags,
    selectedPrimaryIds,
    selectedSecondaryTagIds,
    groupedSecondaryTags,
    onTogglePrimary,
    onToggleSecondary,
    isLoading,
}) => {
    const { isDarkMode } = useTheme();

    // Get primary tag by ID
    const getPrimaryTag = (primaryId: string): PrimaryTagData | undefined => {
        return primaryTags.find((pt) => pt.id === primaryId);
    };

    if (isLoading) {
        return (
            <div
                className={`px-4 py-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
            >
                טוען תגיות...
            </div>
        );
    }

    if (primaryTags.length === 0) {
        return (
            <div
                className={`px-4 py-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
            >
                אין תגיות זמינות
            </div>
        );
    }

    return (
        <>
            {/* Step 1: Primary Tags Selection */}
            <div
                className={`p-3 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"
                    }`}
            >
                <div
                    className={`text-xs font-medium mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                >
                    בחר קטגוריות
                </div>
                <div className="flex flex-wrap gap-2">
                    {primaryTags.map((pt) => {
                        const isSelected = selectedPrimaryIds.includes(pt.id);
                        return (
                            <button
                                key={pt.id}
                                type="button"
                                onClick={() => onTogglePrimary(pt.id)}
                                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-semibold transition-all duration-200
                  ${isSelected ? "ring-2 ring-offset-1" : "opacity-70 hover:opacity-100"}
                `}
                                style={{
                                    backgroundColor: pt.color,
                                    color: getTextColor(pt.color),
                                    ...(isSelected ? { ringColor: pt.color } : {}),
                                }}
                            >
                                {isSelected && <Check className="w-3 h-3" />}
                                {pt.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Secondary Tags Selection (grouped by Primary) */}
            {selectedPrimaryIds.length > 0 && (
                <div className="p-2">
                    {selectedPrimaryIds.map((primaryId) => {
                        const primaryTag = getPrimaryTag(primaryId);
                        const secondaryTagsForPrimary = groupedSecondaryTags[primaryId] || [];
                        if (!primaryTag || secondaryTagsForPrimary.length === 0) return null;

                        const lightBgColor = getLighterColor(primaryTag.color);

                        return (
                            <div
                                key={primaryId}
                                className="mb-2 last:mb-0 rounded-lg overflow-hidden"
                                style={{
                                    backgroundColor: isDarkMode
                                        ? `${primaryTag.color}30`
                                        : `${lightBgColor}50`,
                                }}
                            >
                                {/* Primary tag header */}
                                <div
                                    className="px-3 py-1.5 text-xs font-semibold"
                                    style={{
                                        color: isDarkMode ? lightBgColor : primaryTag.color,
                                    }}
                                >
                                    {primaryTag.name}
                                </div>

                                {/* Secondary tags */}
                                <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                                    {secondaryTagsForPrimary.map((st) => {
                                        const isSelected = selectedSecondaryTagIds.includes(st.id);
                                        return (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => onToggleSecondary(st.id)}
                                                className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-md
                          text-xs font-medium transition-all duration-200
                          ${isSelected
                                                        ? ""
                                                        : isDarkMode
                                                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                                            : "bg-white/70 text-slate-600 hover:bg-white"
                                                    }
                        `}
                                                style={
                                                    isSelected
                                                        ? {
                                                            backgroundColor: lightBgColor,
                                                            color: getTextColor(lightBgColor),
                                                        }
                                                        : {}
                                                }
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                                {st.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state for secondary tags */}
            {selectedPrimaryIds.length === 0 && (
                <div
                    className={`px-4 py-3 text-sm text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                >
                    בחר קטגוריה ראשית כדי לראות תגיות משניות
                </div>
            )}
        </>
    );
};

export default TagDropdownContent;
