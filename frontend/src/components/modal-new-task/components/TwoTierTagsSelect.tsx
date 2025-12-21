import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    type PrimaryTagData,
    type SecondaryTagData,
    getLighterColor,
    getTextColor
} from "../../../schemas/tagTypes";

interface TwoTierTagsSelectProps {
    primaryTags: PrimaryTagData[];
    secondaryTags: SecondaryTagData[];
    selectedSecondaryTagIds: string[];
    onChange: (secondaryTagIds: string[]) => void;
    isLoading?: boolean;
}

/**
 * Two-Tier Tag Selection Component
 * 
 * Flow:
 * 1. User first selects Primary Tags (categories like DB, APP, NETWORK)
 * 2. Based on selected Primary Tags, Secondary Tags are shown grouped by Primary
 * 3. User selects Secondary Tags (actions like Update, Test, Bug Fix)
 * 4. Only Secondary Tag IDs are stored on the task
 */
const TwoTierTagsSelect: React.FC<TwoTierTagsSelectProps> = ({
    primaryTags,
    secondaryTags,
    selectedSecondaryTagIds,
    onChange,
    isLoading = false,
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPrimaryIds, setSelectedPrimaryIds] = useState<string[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    // Get selected secondary tags
    const selectedSecondaryTags = secondaryTags.filter((t) =>
        selectedSecondaryTagIds.includes(t.id)
    );

    // Get primary tags that have selected secondary tags
    const activePrimaryIds = useMemo(() => {
        const primaryIds = new Set<string>();
        selectedSecondaryTags.forEach((st) => {
            primaryIds.add(st.primaryTagId);
        });
        return Array.from(primaryIds);
    }, [selectedSecondaryTags]);

    // Auto-select primary tags that have selected secondary tags
    useEffect(() => {
        if (activePrimaryIds.length > 0) {
            setSelectedPrimaryIds((prev) => {
                const newIds = [...new Set([...prev, ...activePrimaryIds])];
                return newIds;
            });
        }
    }, [activePrimaryIds]);

    // Filter secondary tags by selected primary tags
    const filteredSecondaryTags = useMemo(() => {
        if (selectedPrimaryIds.length === 0) return [];
        return secondaryTags.filter((st) =>
            selectedPrimaryIds.includes(st.primaryTagId)
        );
    }, [secondaryTags, selectedPrimaryIds]);

    // Group secondary tags by primary tag
    const groupedSecondaryTags = useMemo(() => {
        const grouped: Record<string, SecondaryTagData[]> = {};
        filteredSecondaryTags.forEach((st) => {
            if (!grouped[st.primaryTagId]) {
                grouped[st.primaryTagId] = [];
            }
            grouped[st.primaryTagId].push(st);
        });
        return grouped;
    }, [filteredSecondaryTags]);

    // Toggle primary tag selection
    const togglePrimaryTag = (primaryId: string) => {
        const isSelected = selectedPrimaryIds.includes(primaryId);
        if (isSelected) {
            // Remove primary and its secondary tags
            const secondaryIdsToRemove = secondaryTags
                .filter((st) => st.primaryTagId === primaryId)
                .map((st) => st.id);
            setSelectedPrimaryIds((prev) => prev.filter((id) => id !== primaryId));
            onChange(selectedSecondaryTagIds.filter((id) => !secondaryIdsToRemove.includes(id)));
        } else {
            setSelectedPrimaryIds((prev) => [...prev, primaryId]);
        }
    };

    // Toggle secondary tag selection
    const toggleSecondaryTag = (tagId: string) => {
        if (selectedSecondaryTagIds.includes(tagId)) {
            onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
        } else {
            onChange([...selectedSecondaryTagIds, tagId]);
        }
    };

    // Remove a secondary tag
    const removeSecondaryTag = (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
    };

    // Get primary tag by ID
    const getPrimaryTag = (primaryId: string): PrimaryTagData | undefined => {
        return primaryTags.find((pt) => pt.id === primaryId);
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
                    {selectedSecondaryTags.length === 0 ? (
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-400"}>
                            בחר תגיות...
                        </span>
                    ) : (
                        selectedSecondaryTags.map((tag) => {
                            const primaryTag = getPrimaryTag(tag.primaryTagId);
                            const lightColor = primaryTag ? getLighterColor(primaryTag.color) : "#93C5FD";
                            return (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                                    style={{
                                        backgroundColor: lightColor,
                                        color: getTextColor(lightColor),
                                    }}
                                >
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={(e) => removeSecondaryTag(tag.id, e)}
                                        className="hover:opacity-70 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })
                    )}
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={`
            absolute top-full mt-2 right-0 left-0 z-30
            max-h-72 overflow-y-auto
            ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
            rounded-xl border-2 shadow-xl
            ${isDarkMode
                            ? "bg-slate-800 border-slate-600"
                            : "bg-white border-slate-200"
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
                    ) : primaryTags.length === 0 ? (
                        <div
                            className={`px-4 py-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                        >
                            אין תגיות זמינות
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Primary Tags Selection */}
                            <div className={`p-3 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                                <div className={`text-xs font-medium mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    בחר קטגוריות
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {primaryTags.map((pt) => {
                                        const isSelected = selectedPrimaryIds.includes(pt.id);
                                        return (
                                            <button
                                                key={pt.id}
                                                type="button"
                                                onClick={() => togglePrimaryTag(pt.id)}
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
                                                        ? `${primaryTag.color}30` // 30 = ~19% opacity
                                                        : `${lightBgColor}50`,    // 50 = ~31% opacity
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
                                                                onClick={() => toggleSecondaryTag(st.id)}
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
                                <div className={`px-4 py-3 text-sm text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    בחר קטגוריה ראשית כדי לראות תגיות משניות
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TwoTierTagsSelect;
